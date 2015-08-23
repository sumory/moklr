(function (L) {
    var _this = null;
    L.Profile = L.Profile || {};
    _this = L.Profile = {
        data: {
            currentCollectionId: "",
            currentHarId: "",
            collections: []
        },
        init: function () {

            juicer.set({
                'cache': false
            });

            $("#harform").on('click', 'a#queryBtn', function () {
                $("#query-form").show();
                $("#header-form").hide();
                $("#cookie-form").hide();
            });
            $("#harform").on('click', 'a#headerBtn', function () {
                $("#query-form").hide();
                $("#header-form").show();
                $("#cookie-form").hide();
            });

            $("#harform").on('click', 'a#cookieBtn', function () {
                $("#query-form").hide();
                $("#header-form").hide();
                $("#cookie-form").show();
            });

            $("#harform").on('click', 'a#previewBtn', function () {
                var har = _this.getHarObject();
                har = JSON.stringify(har, null, 2);
                _this.showPreview("Preview Har", har);

            });

            _this.initHarOpsEnvent();
            _this.initCollectionOpsEnvent();

            //初始化界面时用一个简单地get请求初始化右侧harform
            _this.initDefaultHar();
        },

        initDefaultHar: function () {
            _this.renderForm({
                "content": {
                    "method": "GET",
                    "url": "http://baidu.com",
                    "httpVersion": "HTTP/1.1",
                    "queryString": [],
                    "headers": [
                        {
                            "name": "Accept",
                            "value": "*/*"
                        }
                    ],
                    "cookies": []
                }
            });
        },


        initCollectionOpsEnvent: function () {
            $("#my-collections-area #my-collections").on("mouseenter", ".my-collection-li", function () {
                $(this).css("background-color", "#eee");
                $(this).find(".collection-ops").css("display", "inline-block").show();
            });

            $("#my-collections-area #my-collections").on("mouseleave", ".my-collection-li", function () {
                $(this).css("background-color", "#fff");
                $(this).find(".collection-ops").hide();
            });


            $("#my-collections-area").on("click", "button.editCollection", function () {
                var c = {
                    id: $(this).parent().parent().attr("data-id"),
                    name: $(this).parent().parent().attr("data-name")
                };

                var tpl = $("#edit-collection-tpl").html();
                var html = juicer(tpl, c);

                var d = dialog({
                    title: 'Edit Collection',
                    content: html,
                    width: 450,
                    okValue: 'Modify',
                    ok: function () {
                        this.title('Committing…');
                        var newName = $("#new_collection_name").val();
                        if (!newName || !c.id) {
                            $("#edit-collection-tip").text("null id or null name");
                            return false;
                        }

                        $.ajax({
                            type: "POST",
                            url: "/user/collection/edit",
                            data: {
                                id: c.id,
                                name: newName
                            },
                            success: function (result) {
                                if (result.success) {
                                    d.close();
                                    $("#my-collection-li-" + c.id).attr("data-name", newName);//更新li上的属性
                                    $("#my-collection-li-" + c.id + " .collection-name a").text(newName);//更新a文字
                                } else {
                                    d.close();
                                    _this.showTipDialog(result.msg);
                                }
                            },
                            error: function () {
                                $("#edit-collection-tip").text("create collection error!");
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

            //导入collection按钮事件
            $("#my-collections-area").on("click", "button.importCollection", function () {
                var c = {
                    id: $(this).parent().parent().attr("data-id"),
                    name: $(this).parent().parent().attr("data-name")
                };

                var tpl = $("#import-collection-tpl").html();
                var html = juicer(tpl, c);

                var d = dialog({
                    title: 'Import to Collection',
                    content: html,
                    width: 550,
                    okValue: 'Modify',
                    ok: function () {
                        this.title('Committing…');
                        var to_import_content = $("#to_import_content").val();
                        if (!to_import_content || !c.id) {
                            $("#import-collection-tip").text("input collection content to import.");
                            return false;
                        }

                        try {
                            JSON.parse(to_import_content);
                        } catch (e) {
                            $("#import-collection-tip").text("the content to import must be a json object.");
                            return false;
                        }

                        $.ajax({
                            type: "POST",
                            url: "/user/collection/import",
                            data: {
                                id: c.id,
                                content: to_import_content
                            },
                            success: function (result) {
                                if (result.success) {
                                    d.close();
                                    //  setTimeout(function(){
                                    _this.getHars(c.id);//重新获取该collection下的har列表
                                    //},1000);


                                } else {
                                    d.close();
                                    _this.showTipDialog(result.msg);
                                }
                            },
                            error: function () {
                                $("#import-collection-tip").text("import to collection error!");
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

            //删除collection按钮
            $("#my-collections-area").on("click", "button.deleteCollection", function () {
                var thisBtn = $(this);
                var toDeleteCollectionId = $(this).attr("data-id");
                var d = dialog({
                    title: 'Warning',
                    content: 'sure to delete this collection?',
                    okValue: 'Delete',
                    ok: function () {
                        this.title('Committing…');
                        $.ajax({
                            type: "POST",
                            url: "/user/collection/delete",
                            data: {
                                id: toDeleteCollectionId
                            },
                            success: function (result) {
                                if (result.success) {
                                    d.close();
                                    $("#my-collection-li-" + toDeleteCollectionId).remove();//删除li
                                    $("ul#collection-hars-" + toDeleteCollectionId).remove();//删除li下属的ul
                                    _this.resetCollectionCount();//重置badge计数
                                } else {
                                    d.close();
                                    _this.showTipDialog(result.msg);
                                }
                            },
                            error: function () {
                                $("#create-collection-tip").text("create collection error!");
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


            $("#my-collections").on("click", "li a.my-collection-a", function () {
                var collectionId = $(this).attr("data-id");
                if ($("#my-collections #collection-hars-" + collectionId)[0]) {
                    $("#my-collections #collection-hars-" + collectionId).remove();
                } else {
                    var cid = $(this).attr('data-id');
                    _this.getHars(cid);
                }
            });


            $('#createCollectionModal').on('show.bs.modal', function (event) {
                var button = $(event.relatedTarget);
                var modal = $(this);
            });

            $('#createCollectionBtn').click(function () {
                var newName = $("#new-collection-name").val();
                if (!newName) {
                    $("#create-collection-tip").text('input the name of collection!');
                    return;
                }

                $.ajax({
                    type: "POST",
                    url: "/user/collection/create",
                    data: {
                        name: newName
                    },
                    success: function (result) {
                        if (result.success) {
                            $('#createCollectionModal').modal('hide');

                            if ($("#my-collections")[0]) {//已存在collection tree
                                var tpl = $("#single-collection-tpl").html();
                                var html = juicer(tpl, result.data);
                                $("#my-collections").prepend(html);
                                _this.resetCollectionCount();
                            } else {
                                var tpl = $("#single-collection-with-ul-tpl").html();
                                var html = juicer(tpl, result.data);
                                $("#my-collections-area").html(html);
                                $("#collection-count-bage").text("1");
                            }

                        } else {
                            $("#create-collection-tip").text(result.msg);
                        }
                    },
                    error: function () {
                        $("#create-collection-tip").text("create collection error!");
                    }
                });


            });
        },

        initHarOpsEnvent: function () {
            //点击“加号“添加新的输入行
            $('#harform').on('click', '.form-group.pair:last-of-type .btn-success', _this.addKeyPair);

            //删除输入行
            $('#harform').on('click', '.form-group.pair .btn-danger', function (event) {
                $(this).parents('.form-group').remove();//删除本行输入
                _this.rebuildUrl();//重新构建url
            });

            //点击最后一个输入行时添加一个新的输入行
            $('#harform').on('focus', '.form-group.pair:last-child input', _this.addKeyPair);

            //方法下拉框事件
            $('#harform').on('change', 'select[name="method"]', function (e) {
                if ($(this).val() == 'GET') {
                    $("form[name=postData-params]").hide();
                    $('div[id=for-post-header]').remove();
                } else if ($(this).val() == 'POST') {
                    $("form[name=postData-params]").show();
                    if ($("#for-post-header")[0]) {//如果已经存在了Content-Type这个header
                        $("#for-post-header input[name=value]").val("application/x-www-form-urlencoded");
                    } else {
                        var html = $("#harform-header-for-post-tpl").html();
                        $('form[name=headers] h5').after(html);
                    }

                }

            });

            //post类型下拉框事件
            $("#harform").on('change', 'select[name=postData-mimeType]', function (e) {
                var thisValue = $(this).val();
                if (thisValue === 'application/x-www-form-urlencoded' || thisValue === "multipart/form-data") {
                    $("div[name=postData-params]").show();
                    $("div[name=postData-text]").hide();
                } else if (thisValue === 'application/json') {
                    $("div[name=postData-params]").hide();
                    $("div[name=postData-text]").show();
                }

                if (!($("#for-post-header")[0])) {//如果不存在了Content-Type这个header
                    var html = $("#harform-header-for-post-tpl").html();
                    $('form[name=headers] h5').after(html);
                }
                //将header头的content-type设为变化后的值
                $("#for-post-header input[name=value]").val(thisValue);
            });

            //QueryString的各个输入框的监控事件
            $('#harform').on('keyup keypress change blur', ' form[name=queryString] .form-control', function (e) {
                _this.rebuildUrl();
            });

            //url输入框的监控事件
            $("#harform").on('keyup keypress change blur', 'input[name=url]', function () {
                _this.rebuildQueryString();
            });

            //点击每个har连接
            $("#my-collections").on("click", "a.my-har-a", function () {
                var hid = $(this).attr('data-id');
                _this.getHar(hid);
            });

            //删除har按钮
            $("#harform").on('click', ".deleteHarBtn", function () {
                var harId = $(this).attr("data-id");
                if (!harId) {
                    _this.showTipDialog("Warning", "No har to delete");
                    return;
                }


                var d = dialog({
                    title: 'Warning',
                    content: 'sure to delete this har?',
                    okValue: 'Delete',
                    ok: function () {
                        this.title('Committing…');
                        $.ajax({
                            type: "post",
                            url: "/user/har/delete",
                            data: {
                                harId: harId
                            },
                            success: function (result) {
                                if (result.success) {
                                    var ddd = dialog({
                                        title: 'Tip',
                                        content: 'Delete success'
                                    });
                                    ddd.show();
                                    setTimeout(function () {
                                        ddd.close().remove();
                                    }, 2000);
                                    d.close();
                                    $("#my-har-li-" + harId).remove();//删除左侧树中对应的har
                                    _this.initDefaultHar();//初始化一个默认的har
                                } else {
                                    d.close();
                                    _this.showTipDialog("Error", "Delete har error: " + result.msg);
                                }
                            },
                            error: function (error) {
                                d.close();
                                _this.showTipDialog("Request Error", error);
                            }
                        });
                    },
                    cancelValue: 'Cancel',
                    cancel: function () {
                    }
                });
                d.show();


            });

            //点击"send"按钮
            $("#harform").on('click', '#sendBtn', function () {
                var harObject = _this.getHarObject();

                $.ajax({
                    type: "get",
                    url: "/run/exec",
                    data: {
                        r: harObject
                    },
                    success: function (result) {
                        if (result.success) {
                            var body = result.data.body;
                            try {
                                //if(typeof body === 'object')
                                body = JSON.stringify(JSON.parse(body), null, 2);
                            } catch (e) {

                            }
                            var previewContent = "//Http StatusCode:" + result.data.responseStatus + " @" + _this.formatDate(new Date()) + "\n\n" + body;
                            _this.showPreview("Response OK", previewContent);
                            delete result.data.body
                        } else {
                            $("#codeArea").hide();
                            $("#execArea").show();
                            if (result.errorCode == 1)
                                _this.showPreview("Response Error", "【构建的请求格式有误，请检查输入项】" + result.msg);
                            else if (result.errorCode == 2)
                                _this.showPreview("Response Error", "【执行代码发送http请求失败】" + result.msg);
                            else
                                _this.showPreview("Response Error", "【其它错误】" + result.msg);
                        }
                    },
                    error: function (error) {
                        _this.showPreview("Response Error", JSON.stringify(error, null, 2));
                    }
                });
            });

            //点击“save”按钮
            $("#harform").on('click', '#updateBtn', function () {
                var harContent = _this.getHarObject();
                var harName = $("#har_name")[0] && $("#har_name").val();
                var harId = $("#har_id")[0] && $("#har_id").val();

                if (!harId) {
                    dialog({
                        title: 'Warning',
                        content: 'No target to update. Use "Add to Collection" to create a new one',
                        ok: function () {
                        },
                        cancel: false
                    }).show();
                    return;
                }

                if (!harName) {
                    dialog({
                        title: 'Warning',
                        content: 'Name should not be empty',
                        ok: function () {
                        },
                        cancel: false
                    }).show();
                    return;
                }

                $.ajax({
                    type: "post",
                    url: "/user/har/save",
                    data: {
                        harName: harName,
                        harId: harId,
                        harContent: harContent
                    },
                    success: function (result) {
                        if (result.success) {
                            var dd = dialog({
                                title: 'Tip',
                                content: 'Save success'
                            });
                            dd.show();
                            setTimeout(function () {
                                dd.close().remove();
                            }, 2000);

                            //在左侧collection树中更新这个har
                            try {
                                $("#my-har-li-" + harId + " span").text(harContent.method);
                                $("#my-har-li-" + harId + " a").text(harName);
                            } catch (e) {
                                console.error("更新左侧目录树出错");
                            }

                        } else {
                            _this.showTipDialog("Error", result.msg);
                        }
                    },
                    error: function (error) {
                        _this.showTipDialog("Error", error);
                    }
                });
            });

            //点击"Add To Collection"按钮
            $("#harform").on('click', '#addToCollectionBtn', function () {
                var harObject = _this.getHarObject();

                var currentCollections = _this.getCurrentCollections();
                var tpl = $("#add-har-to-collection-tpl").html();
                var html = juicer(tpl, {
                    collections: currentCollections,
                    harName: $("#har_name").val()
                });


                var d = dialog({
                    id: new Date().getTime(),
                    title: 'Add Har to Collection',
                    content: html,
                    okValue: 'Add',
                    width: 500,
                    ok: function () {
                        this.title('Committing…');
                        var collectionId = $("#to_select_collection").val();
                        if (!collectionId) {
                            $("#add-har-to-collection-tip").text("You must select one exsiting collection");
                            return false;
                        }

                        var new_har_name = $("#new_har_name").val();
                        if (!new_har_name) {
                            $("#add-har-to-collection-tip").text("You must input har name");
                            return false;
                        }

                        console.log(collectionId, new_har_name)


                        $.ajax({
                            type: "POST",
                            url: "/user/har/addHarToCollection",
                            data: {
                                collectionId: collectionId,
                                har: harObject,
                                name: new_har_name
                            },
                            success: function (result) {
                                if (result.success) {
                                    //在左侧collection树中添加新的这个har
                                    //try{
                                    //    var tpl = $("#single-har-tpl").html();
                                    //    var data = {
                                    //        method: result.data.content.method,
                                    //        harId: result.data.harId,
                                    //        name: result.data.name
                                    //    };
                                    //    var html = juicer(tpl, data);
                                    //    if($("#collection-hars-"+collectionId)[0]){//如果存在ul标签
                                    //        $("#collection-hars-"+collectionId).prepend(html);
                                    //    }else{
                                    //        html='<ul class="collection-hars" id="collection-hars' + collectionId + '">'+html+'</ul>';
                                    //        $("#my-collection-li-"+collectionId).after(html);
                                    //    }
                                    //}catch(e){
                                    //    console.error("更新左侧目录树出错");
                                    //}
                                    _this.getHars(collectionId);//使用词句代替上面一坨


                                    _this.getHar(result.data.harId);//成功添加到一个collection后重新初始化右侧harForm
                                    d.close();
                                } else {
                                    $("#add-har-to-collection-tip").text("add har to collection error!" + result.msg);
                                }
                            },
                            error: function () {
                                $("#add-har-to-collection-tip").text("add har to collection error!");
                            }
                        });

                        //return false;加上此句，会导致一直使用第一次提交的collectionId和harName
                    },
                    cancelValue: 'Cancel',
                    cancel: function () {
                    }
                });
                d.showModal();

            });
        },

        resetCollectionCount: function () {
            if ($("#my-collections li.my-collection-li") && $("#my-collections li.my-collection-li").length > 0)
                $("#collection-count-bage").text($("#my-collections li.my-collection-li").length);
            else
                $("#collection-count-bage").text("0");
        },

        showTipDialog: function (title, content) {
            if (!content) {
                content = title;
                title = "Tips";
            }
            var d = dialog({
                title: title || 'Tips',
                content: content,
                cancel: false,
                ok: function () {
                }
            });
            d.show();
        },

        addKeyPair: function (event) {
            var self = $(this);
            var group = self.parents('.form-group');
            var newGroup = group.clone();
            newGroup.find('input[name=name]').val('');
            newGroup.find('input[name=value]').val('');
            var form = self.parents('form');
            newGroup.appendTo(form);
        },
        getHarObject: function () {
            var isGet = true;
            var methodInput = $("select[name=method]").val();
            if (methodInput == 'GET') {
                isGet = true;
            } else if (methodInput == 'POST') {
                isGet = false;
            }


            var url = $("input[name=url]").val();


            var response = {//初始化
                method: methodInput,
                url: $("input[name=url]").val(),
                httpVersion: 'HTTP/1.1',
                queryString: [],
                headers: [],
                cookies: [],
                postData: {
                    mimeType: 'application/x-www-form-urlencoded',
                    params: [],//application/x-www-form-urlencoded或form-data时使用
                    text: ''//application/json时使用
                }
            };


            var groups = ['queryString', 'headers', 'cookies'];
            groups.forEach(function (pair) {
                var params = [];
                $('form[name="' + pair + '"] .pair input[name="name"]').slice(0, -1).each(function (index, header) {
                    var value = $(header).val();

                    if (value.trim() !== '') {
                        var v = $(this).next().val();//获取兄弟节点即value节点

                        params.push({
                            name: value,
                            value: v
                        });
                    }
                });
                response[pair] = params;
            });

            //组装postData
            if (isGet) {
                delete response.postData;
            } else {
                var mimeType = $("select[name=postData-mimeType]").val();

                if (mimeType === 'application/x-www-form-urlencoded' || mimeType === "multipart/form-data") {
                    var postData = 'postData-params';
                    var postDataParams = [];
                    delete response.postData.text;

                    $('form[name="' + postData + '"] .pair input[name="name"]').slice(0, -1).each(function (index, header) {
                        var value = $(header).val();

                        if (value.trim() !== '') {
                            postDataParams.push({
                                name: value
                            });
                        }
                    });

                    $('form[name="' + postData + '"] .pair input[name="value"]').slice(0, -1).each(function (index, header) {
                        if (postDataParams[index]) {
                            postDataParams[index].value = $(header).val()
                        }
                    });

                    if (postDataParams.length == 0) {
                        delete response.postData;
                    } else {
                        response['postData'].mimeType = mimeType;
                        response['postData'].params = postDataParams;
                    }
                } else if (mimeType === 'application/json') {
                    delete response.postData.params;
                    response['postData'].mimeType = mimeType;
                    try {
                        var tmp = $("div[name=postData-text] textarea").val().replace(/\n/g, "").replace(/\t/g, "").replace(/\r\n/g, "");
                        var postDataText = tmp;
                        response['postData'].text = postDataText;
                    }
                    catch (e) {
                        console.error(e);
                        $("div[name=postData-text] span").text("输入的数据须为json类型");
                        response['postData'].text = {};
                    }
                }
            }

            return response;
        },

        parseURL: function (url) {
            var a = document.createElement('a');
            a.href = url;
            return {
                source: url,
                protocol: a.protocol.replace(':', ''),
                host: a.hostname,
                port: a.port,
                query: a.search,
                params: (function () {
                    var ret = {},
                        seg = a.search.replace(/^\?/, '').split('&'),
                        len = seg.length,
                        i = 0,
                        s;
                    for (; i < len; i++) {
                        if (!seg[i]) {
                            continue;
                        }
                        s = seg[i].split('=');
                        ret[s[0]] = s[1];
                    }
                    return ret;
                })(),
                file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
                hash: a.hash.replace('#', ''),
                path: a.pathname.replace(/^([^\/])/, '/$1'),
                relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
                segments: a.pathname.replace(/^\//, '').split('/')
            };

            //var myURL = parseURL('http://sumory.com:80/test/index.xyz?name=s&age=18#abc');
            //console.dir(myURL)
        },

        rebuildUrl: function () {
            var url = $("input[name=url]").val();

            var query = "";
            var pCount = 0;
            $('form[name=queryString] .pair input[name="name"]').slice(0, -1).each(function (index, header) {
                var name = $(header).val();

                if (name.trim() !== '') {
                    var value = $(this).next().val();//获取兄弟节点即value节点
                    query += "" + name + "=" + value + "&";
                    pCount++;
                }
            });

            if (query && query.lastIndexOf("&") == query.length - 1) {
                query = query.substring(0, query.length - 1);
            }

            var left = '';
            if (url.indexOf("?") != -1)
                left = url.substring(0, url.indexOf("?"));
            else
                left = url;

            var r = '';
            if (query)
                r = left + "?" + query;
            else
                r = left;
            $("input[name=url]").val(r);
            //if (pCount > 0)
            //    $("#queryBtn span").text("URL Params(" + pCount + ")");
            //else
            $("#queryBtn span").text("URL Params");
        },

        //重新构建QueryString的多个输入框
        rebuildQueryString: function () {
            var pCount = 0;
            var url = $("input[name=url]").val();
            var params = _this.parseURL(url).params;
            $("form[name=queryString]").html('<h5>QueryString</h5>');
            var tpl = $("#harform-input-query-tpl").html();

            if (Object.keys(params).length == 0) {//没有参数，则初始化一个空行
                var obj = {
                    name: "",
                    value: ""
                };
                var html = juicer(tpl, obj);
                $("form[name=queryString]").append(html);
                pCount = 0;
            }
            else {
                Object.keys(params).forEach(function (k) {
                    if (k && params[k]) {
                        pCount++;
                        var obj = {
                            name: k,
                            value: params[k] || ""
                        };
                        var html = juicer(tpl, obj);
                        $("form[name=queryString]").append(html);
                    }
                });
                //点击最后一行，触发产生一个新的空输入行
                $('form[name=queryString] .form-group.pair:last-of-type .btn-success').click();

            }

            //if (pCount > 0)
            //    $("#queryBtn span").text("URL Params(" + pCount + ")");
            //else
            $("#queryBtn span").text("URL Params");
        },


        getHar: function (hid) {
            $.ajax({
                type: "GET",
                url: "/user/har",
                data: {
                    hid: hid
                },
                success: function (result) {
                    if (result.success) {
                        _this.data.currentHarId = hid;
                        _this.rebuildHar(hid, result.data);
                    } else {
                        alert("获取har数据出错：" + result.msg);
                    }
                },
                error: function () {
                    alert("获取har数据出错");
                }
            });
        },

        //重新获取某个har时重建右侧视图
        rebuildHar: function (hid, har) {
            //har = JSON.stringify(har, null ,2);
            //$("#selected_har_code").text(har);
            _this.renderForm(har);
        },

        //初始化输入表单
        renderForm: function (har) {
            var tpl = $("#harform-tpl").html();

            //将两个属性直接放在content里，省去模板使用的麻烦
            har.content = har.content || {};
            har.content.har_id = har.harId;
            har.content.har_name = har.name;

            var html = juicer(tpl, har.content);
            $("#harform").html(html);
            if (har.content && har.content.method === "POST") {
                $("#postData-form").show();
                $("#postData-form select[name=postData-mimeType]").val(har.content.postData.mimeType);
            }
        },

        getCollections: function (callback) {
            $.ajax({
                type: "GET",
                url: "/user/collections",
                data: {},
                success: function (result) {
                    if (result.success) {
                        _this.data.collections = result.data;
                        callback && callback();
                    } else {
                        alert("获取collections数据出错：" + result.msg);
                    }
                },
                error: function () {
                    alert("获取collections数据出错");
                }
            });
        },

        //获取左侧collection树列出的所有collection
        getCurrentCollections: function () {
            var result = [];

            $("#my-collections li.my-collection-li").each(function () {
                if ($(this).attr("data-id") && $(this).attr("data-id") != '') {
                    result.push({
                        id: $(this).attr("data-id"),
                        name: $(this).attr("data-name")
                    })
                }
            })
            return result;
        },


        getHars: function (collectionId) {
            $.ajax({
                type: "GET",
                url: "/user/hars",
                data: {
                    cid: collectionId
                },
                success: function (result) {
                    if (result.success) {
                        _this.data.currentCollectionId = collectionId;
                        _this.rebuildCollectionTree(collectionId, result.data);
                    } else {
                        alert("获取collection数据出错：" + result.msg);
                    }
                },
                error: function () {
                    alert("获取collection数据出错");
                }
            });
        },

        //重新获取某个collection下hars时重建列表
        rebuildCollectionTree: function (cid, hars) {
            $("ul#collection-hars-" + cid).remove();
            var tpl = $("#collection-tree-tpl").html();
            var data = {
                collectionId: cid,
                hars: hars
            };
            var html = juicer(tpl, data);
            $("#my-collection-li-" + cid).after(html);
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
        showPreview: function (title, content) {
            $('#right-content h5').text(title);
            $('#preview_code code').text(content);
            $('#preview_code').show();
            _this.highlightCode();
        },
        highlightCode: function () {
            $('pre code').each(function () {
                hljs.highlightBlock($(this)[0]);
            });
        },
    };
}(Moklr));
