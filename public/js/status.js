(function (L) {
    var _this = null;
    L.Status = L.Status || {};
    _this = L.Status = {
        data: {
            currentStatuAPIId: ""
        },
        init: function () {
            //初始化status api树
            _this.getStatusAPIs();

            //绑定事件
            _this.initStatuAPIOpsEnvent();

            juicer.register("momentFormat", _this.momentFormat);

            $("body").on("click", ".api_response", function(){
               // console.log("fsdfs")
            });

            $('[data-toggle="tooltip"]').tooltip();
        },

        initStatuAPIOpsEnvent: function () {
            $("#status-apis-area").on("mouseenter", " #status-apis .status-api-li", function () {
                $(this).css("background-color", "#eee");
                $(this).find(".status-api-ops").css("display", "inline-block").show();
            });

            $("#status-apis-area").on("mouseleave", " #status-apis .status-api-li", function () {
                $(this).css("background-color", "#fff");
                $(this).find(".status-api-ops").hide();
            });


            //修改status api
            $("body").on("click", "#saveStatusAPIBtn", function () {
                var statusAPIId =$("#edit_status_api_id").val();
                var cron =$("#edit_status_api_cron").val();
                var name =$("#edit_status_api_name").val();
                var monitor = $("#edit_status_api_monitor").val();
                if(!statusAPIId || !cron || !name){
                   _this.showTipDialog("Warning","wrong params, please check.");
                    return;
                }

                if(monitor == "1") {
                    monitor = true;
                } else {
                    monitor = false;
                }


                $.ajax({
                    type: "POST",
                    url: "/status/api/modify",
                    data: {
                        statusAPIId:statusAPIId,
                        cron:cron,
                        name:name,
                        monitor:monitor
                    },
                    success: function (result) {
                        if (result.success) {
                            var ddd = dialog({
                                title: 'Tip',
                                content: 'Save success'
                            });
                            ddd.show();
                            setTimeout(function () {
                                ddd.close().remove();
                            }, 2000);

                            $("#status-api-li-" + statusAPIId).attr("data-name", name);//更新li上的属性
                            $("#status-api-li-" + statusAPIId + " .status-api-name a").text(name);//更新a文字
                        } else {
                            _this.showTipDialog("Warning",result.msg);
                        }
                    },
                    error: function () {
                        _this.showTipDialog("Warning", "modify status api request exception!");
                    }
                });

            });

            //是否显示har
            $("body").on("click", "#showHarBtn", function () {
                if($("#previewHar").css("display")=="none"){
                    $("#previewHar").css("display","block");
                }else{
                    $("#previewHar").css("display", "none");
                }

            });

            //显示log
            $("body").on("click", "#logsStatusAPIBtn", function () {
                var statusAPIId = $("#edit_status_api_id").val();
                if(!statusAPIId){
                    _this.showTipDialog("Waning", "cannot find status api!");
                    return;
                }

                $.ajax({
                    type: "get",
                    url: "/status/api/logs",
                    data: {
                        statusAPIId: statusAPIId
                    },
                    success: function (result) {
                        if (result.success) {
                            var tpl = $("#log-body-tpl").html();
                            var data ={
                                logs:result.data
                            };
                            var html = juicer(tpl, data);
                            $("#logs_body").html(html);
                            $("#logs_row").show();
                        } else {
                            _this.showTipDialog("Error", result.msg);
                        }
                    },
                    error: function () {
                        _this.showTipDialog("Error", "get status api logs request exception");
                    }
                });
            });


            //删除所有日志记录
            $("body").on("click", "#deleteStatusAPILogsBtn", function () {
                var statusAPIId = $("#edit_status_api_id").val();
                if(!statusAPIId){
                    _this.showTipDialog("Waning", "cannot find status api to delete!");
                    return;
                }

                var d = dialog({
                    title: 'Warning',
                    fixed:true,
                    content: 'Sure to delete all logs of this status api?',
                    okValue: 'Delete',
                    ok: function () {
                        this.title('Committing…');
                        $.ajax({
                            type: "post",
                            url: "/status/api/logs/delete",
                            data: {
                                statusAPIId: statusAPIId
                            },
                            success: function (result) {
                                d.close();
                                if (result.success) {
                                    $("#logs_body").html("");
                                } else {
                                    _this.showTipDialog("Error", result.msg);
                                }
                            },
                            error: function () {
                                d.close();
                                _this.showTipDialog("Error", "delete logs request exception");
                            }
                        });
                        return false;
                    },
                    cancelValue: 'Cancel',
                    cancel: function () {
                    }
                });
                d.showModal();
                $("div[role=alertdialog").css("top","260px");
            });


            //删除status api按钮
            $("#status-apis-area").on("click", "button.deleteStatusAPI", function () {
                var thisBtn = $(this);
                var toDeleteStatusAPIId = $(this).attr("data-id");
                var d = dialog({
                    title: 'Warning',
                    content: 'Sure to delete this status api?',
                    okValue: 'Delete',
                    ok: function () {
                        this.title('Committing…');
                        $.ajax({
                            type: "POST",
                            url: "/status/api/delete",
                            data: {
                                statusAPIId: toDeleteStatusAPIId
                            },
                            success: function (result) {
                                if (result.success) {
                                    d.close();
                                    $("#status-api-li-" + toDeleteStatusAPIId).remove();//删除li
                                    _this.resetStatusAPICount();//重置badge计数
                                } else {
                                    d.close();
                                    _this.showTipDialog(result.msg);
                                }
                            },
                            error: function () {
                                d.close();
                                _this.showTipDialog("delete status api exception");
                            }
                        });
                        return false;
                    },
                    cancelValue: 'Cancel',
                    cancel: function () {
                    }
                });
                d.show();
            });


            //点击每个status api连接
            $("#status-apis-area").on("click", "#status-apis li a.status-api-a", function () {
                $("#logs_body").html("");
                var statusAPIId = $(this).attr("data-id");
                $.ajax({
                    type: "GET",
                    url: "/status/api",
                    data: {
                        statusAPIId:statusAPIId
                    },
                    success: function (result) {
                        if (result.success) {
                            var tpl = $("#status-api-tpl").html();
                            var data = {
                                api:result.data,
                                har: JSON.stringify(result.data.content,null,2)
                            };
                            var html = juicer(tpl, data);
                            $("#content-left").html(html);
                        } else {
                            alert("获取status api出错：" + result.msg);
                        }
                    },
                    error: function () {
                        alert("获取status api请求异常");
                    }
                });
            });


            //创建status api按钮事件
            $('#createStatusAPIBtn').click(function () {
                $.ajax({
                    type: "GET",
                    url: "/status/hars",
                    data: {},
                    success: function (result) {
                        if (result.success) {
                            _this.createStatusAPI(result);
                        } else {
                            alert("获取所有hars出错：" + result.msg);
                        }
                    },
                    error: function () {
                        alert("获取所有hars请求异常");
                    }
                });
            });


            $("body").on("change", "#to_select_har", function(){
               var text = $(this).find("option:selected").text();
                $("#status_api_name").val(text);
            });
        },

        //创建status api的弹出框操作
        createStatusAPI: function (result) {
            var tpl = $("#create-status-api-tpl").html();
            var data = {
                hars: result.data
            };
            var html = juicer(tpl, data);

            var d = dialog({
                title: 'Create New Status API',
                content: html,
                okValue: 'Create',
                width: 450,
                ok: function () {
                    this.title('Committing…');
                    var newName = $("#status_api_name").val();
                    if (!newName) {
                        $("#create-status-api-tip").text('input the name of status api!');
                        return false;
                    }

                    var cron = $("#status_api_cron").val();
                    if (!cron) {
                        $("#create-status-api-tip").text('input "cron" of status api!');
                        return false;
                    }

                    var monitor = $("#status_api_monitor").val();
                    if(monitor == "1") {
                        monitor = true;
                    } else {
                        monitor = false;
                    }


                    var toSelectHarId = $("#to_select_har").val();
                    if(!toSelectHarId){
                        $("#create-status-api-tip").text('must select one har!');
                        return false;
                    }

                    var toUseHar ={};
                    var hars = result.data;
                    for(var i = 0;i<hars.length;i++){
                        var h = hars[i];
                        if(h["harId"] == toSelectHarId){
                            toUseHar = h.content;
                        }
                    }

                    if(!toUseHar || !toUseHar.method){
                        $("#create-status-api-tip").text('wrong har format, please check!');
                        return false;
                    }


                    $.ajax({
                        type: "POST",
                        url: "/status/api/create",
                        data: {
                            name: newName,
                            cron: cron,
                            har: toUseHar,
                            monitor: monitor
                        },
                        success: function (r) {
                            if (result.success) {
                                d.close();

                                if ($("#status-apis")[0]) {//已存在collection tree
                                    var tpl = $("#single-status-api-tpl").html();
                                    var html = juicer(tpl, r.data);
                                    $("#status-apis").prepend(html);
                                    _this.resetStatusAPICount();
                                } else {
                                    var tpl = $("#single-collection-with-ul-tpl").html();
                                    var html = juicer(tpl, r.data);
                                    $("#status-apis-area").html(html);
                                    $("#collection-count-bage").text("1");
                                }

                            } else {
                                $("#create-status-api-tip").text(result.msg);
                            }
                        },
                        error: function () {
                            $("#create-status-api-tip").text("create status api error!");
                        }
                    });
                },
                cancelValue: 'Cancel',
                cancel: function () {
                }
            });
            d.showModal();
        },


        resetStatusAPICount: function () {
            if ($("#status-apis li.status-api-li") && $("#status-apis li.status-api-li").length > 0)
                $("#status-api-count-bage").text($("#status-apis li.status-api-li").length);
            else
                $("#status-api-count-bage").text("0");
        },

        showTipDialog: function (title, content) {
            if (!content) {
                content = title;
                title = "Tips";
            }
            var d = dialog({
                title: title || 'Tips',
                content: content,
                width: 350,
                cancel: false,
                ok: function () {
                }
            });
            d.show();
        },

        getStatusAPI: function (statusAPIId) {
            $.ajax({
                type: "GET",
                url: "/status/api",
                data: {
                    statusAPIId: statusAPIId
                },
                success: function (result) {
                    if (result.success) {

                    } else {
                        alert("获取status api数据出错：" + result.msg);
                    }
                },
                error: function () {
                    alert("获取status api数据出错");
                }
            });
        },


        getStatusAPIs: function () {
            $.ajax({
                type: "GET",
                url: "/status/apis",
                data: {},
                success: function (result) {
                    if (result.success) {
                        var tpl = $("#all-status-apis-tpl").html();
                        var data = {
                            statusAPIs: result.data
                        };

                        var html = juicer(tpl, data);
                        $("#status-apis-area").html(html);
                        $("#status-api-count-bage").text(result.data && (result.data.length || 0));
                    } else {
                        alert("获取status api数据出错：" + result.msg);
                    }
                },
                error: function () {
                    alert("获取status api数据出错");
                }
            });
        },


        formatDate: function (now) {
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var date = now.getDate();
            var hour = now.getHours();
            var minute = now.getMinutes();
            var second = now.getSeconds();
            if (second < 10) second = "0" + second;
            return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
        },

        momentFormat: function(originDate){
            return moment(originDate).format("YYYY-MM-DD HH:mm:ss");
        }

    };
}(Moklr));
