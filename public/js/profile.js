(function (L) {
    var _this = null;
    L.Profile = L.Profile || {};
    _this = L.Profile = {
        data: {
            currentCollectionId: "",
            currentHarId: ""
        },
        init: function () {

            $("#my-collections").on("click","li a.my-collection-a", function(){
                var cid = $(this).attr('data-id');
                _this.getHars(cid);
            });

            $("#my-collections").on("click","a.my-har-a", function(){
                var hid = $(this).attr('data-id');
                _this.getHar(hid);
            });



            $("#harform").on('click', 'a#queryBtn', function(){
                $("#query-form").show();
                $("#header-form").hide();
                $("#cookie-form").hide();
            });
            $("#harform").on('click', 'a#headerBtn', function(){
                $("#query-form").hide();
                $("#header-form").show();
                $("#cookie-form").hide();
            });

            $("#harform").on('click', 'a#cookieBtn', function(){
                $("#query-form").hide();
                $("#header-form").hide();
                $("#cookie-form").show();
            });

            $("#harform").on('click', 'a#previewBtn', function(){
                var har = _this.getHarObject();
                har = JSON.stringify(har, null,2);

                $('#right-content h5').text("Preview Har");
                $('#preview_code code').text(har);
                $('#preview_code').show();
                _this.highlightCode();
            });

            _this.initCommonEnvent();

        },

        initCommonEnvent:function(){
            //点击“加号“添加新的输入行
            $('#harform').on('click', '.form-group.pair:last-of-type .btn-success', _this.addKeyPair);

            //点击最后一个输入行时添加一个新的输入行
            $('#harform').on('focus', '.form-group.pair:last-child input', _this.addKeyPair);

            //删除输入行
            $('#harform').on('click', '.form-group.pair .btn-danger', function(event) {
                $(this).parents('.form-group').remove();//删除本行输入
                _this.rebuildUrl();//重新构建url
            });



            //方法下拉框事件
            $('#harform').on('change', 'select[name="method"]', function(e) {
                if($(this).val()=='GET'){
                    $("form[name=postData-params]").hide();
                    $('div[id=for-post-header]').remove();
                }else if($(this).val()=='POST'){
                    $("form[name=postData-params]").show();
                    if($("#for-post-header")[0]){//如果已经存在了Content-Type这个header
                        $("#for-post-header input[name=value]").val("application/x-www-form-urlencoded");
                    }else{
                        var html = $("#harform-header-for-post-tpl").html();
                        $('form[name=headers] h5').after( html);
                    }

                }

            });

            //post类型下拉框事件
            $("#harform").on('change','select[name=postData-mimeType]', function(e){
                console.log("can")
                var thisValue = $(this).val();
                if(thisValue === 'application/x-www-form-urlencoded' || thisValue === "multipart/form-data"){
                    $("div[name=postData-params]").show();
                    $("div[name=postData-text]").hide();
                }else if(thisValue === 'application/json'){
                    $("div[name=postData-params]").hide();
                    $("div[name=postData-text]").show();
                }

                if(!($("#for-post-header")[0])){//如果不存在了Content-Type这个header
                    var html = $("#harform-header-for-post-tpl").html();
                    $('form[name=headers] h5').after( html);
                }
                //将header头的content-type设为变化后的值
                $("#for-post-header input[name=value]").val(thisValue);
            });

            //QueryString的各个输入框的监控事件
            $('#harform').on('keyup keypress change blur', ' form[name=queryString] .form-control', function(e){
                _this.rebuildUrl();
            });

            //url输入框的监控事件
            $("#harform").on('keyup keypress change blur', 'input[name=url]', function(){
                _this.rebuildQueryString();
            });
        },

        addKeyPair : function(event) {
            var self = $(this);
            var group = self.parents('.form-group');
            var newGroup = group.clone();
            newGroup.find('input[name=name]').val('');
            newGroup.find('input[name=value]').val('');
            var form = self.parents('form');
            newGroup.appendTo(form);
        },
        getHarObject : function(){
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
                    text:''//application/json时使用
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
                var mimeType=$("select[name=postData-mimeType]").val();

                if(mimeType === 'application/x-www-form-urlencoded' || mimeType === "multipart/form-data"){
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

                    if(postDataParams.length==0){
                        delete response.postData;
                    }else{
                        response['postData'].mimeType = mimeType;
                        response['postData'].params = postDataParams;
                    }
                }else if(mimeType === 'application/json'){
                    delete response.postData.params;
                    response['postData'].mimeType = mimeType;
                    try{
                        var tmp =$("div[name=postData-text] textarea").val().replace(/\n/g,"").replace(/\t/g,"").replace(/\r\n/g,"");
                        var postDataText = tmp;
                        response['postData'].text =postDataText;
                    }
                    catch(e){
                        console.error(e);
                        $("div[name=postData-text] span").text("输入的数据须为json类型");
                        response['postData'].text ={};
                    }
                }
            }

            return response;
        },
        parseURL : function (url) {
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

        rebuildUrl : function (){
            var url = $("input[name=url]").val();

            var query="";
            var pCount=0;
            $('form[name=queryString] .pair input[name="name"]').slice(0, -1).each(function(index, header) {
                var name = $(header).val();

                if (name.trim() !== '') {
                    var value = $(this).next().val();//获取兄弟节点即value节点
                    query+=""+name+"="+value+"&";
                    pCount++;
                }
            });

            if(query && query.lastIndexOf("&")==query.length-1){
                query = query.substring(0, query.length-1);
            }

            var left ='';
            if(url.indexOf("?")!=-1)
                left = url.substring(0, url.indexOf("?"));
            else
                left=url;

            var r='';
            if(query)
                r= left+"?"+query;
            else
                r= left;
            $("input[name=url]").val(r);
            if(pCount>0)
                $("#queryBtn span").text("URL Params("+pCount+")");
            else
                $("#queryBtn span").text("URL Params");
        },

        //重新构建QueryString的多个输入框
        rebuildQueryString: function (){
            var pCount=0;
            var url = $("input[name=url]").val();
            var params = _this.parseURL(url).params;
            $("form[name=queryString]").html('<h5>QueryString</h5>');
            var tpl = $("#harform-input-query-tpl").html();

            if(Object.keys(params).length==0){//没有参数，则初始化一个空行
                var obj = {
                    name:"",
                    value: ""
                };
                var html = juicer(tpl, obj);
                $("form[name=queryString]").append(html);
                pCount=0;
            }
            else{
                Object.keys(params).forEach(function(k){
                    if(k && params[k]) {
                        pCount++;
                        var obj = {
                            name:k,
                            value: params[k]||""
                        };
                        var html = juicer(tpl, obj);
                        $("form[name=queryString]").append(html);
                    }
                });
                //点击最后一行，触发产生一个新的空输入行
                $('form[name=queryString] .form-group.pair:last-of-type .btn-success').click();

            }

            if(pCount>0)
                $("#queryBtn span").text("URL Params("+pCount+")");
            else
                $("#queryBtn span").text("URL Params");
        },


        updateHar: function(har){

        },

        saveHar: function(har){

        },

        getHar: function(hid){
            $.ajax({
                type: "GET",
                url: "/user/har",
                data: {
                    hid: hid
                },
                success: function (result) {
                    if(result.success){
                        _this.data.currentHarId = hid;
                        _this.rebuildHar(hid, result.data);
                    }else{
                        alert("获取har数据出错："+result.msg);
                    }
                },
                error: function(){
                    alert("获取har数据出错");
                }
            });
        },

        //重新获取某个har时重建右侧视图
        rebuildHar:function(hid, har){
            //har = JSON.stringify(har, null ,2);
            //$("#selected_har_code").text(har);
            _this.renderForm(har);
        },

        //初始化输入表单
        renderForm: function(har){
            var tpl = $("#harform-tpl").html();
            var html = juicer(tpl, har.content);
            $("#harform").html(html);
            if(har.content && har.content.method==="POST"){
                $("#postData-form").show();
                $("#postData-form select[name=postData-mimeType]").val(har.content.postData.mimeType);
            }
        },

        getHars: function(collectionId){
            $.ajax({
                type: "GET",
                url: "/user/hars",
                data: {
                    cid: collectionId
                },
                success: function (result) {
                    if(result.success){
                        _this.data.currentCollectionId = collectionId;
                        _this.rebuildCollectionTree(collectionId, result.data);
                    }else{
                        alert("获取collection数据出错："+result.msg);
                    }
                },
                error: function(){
                    alert("获取collection数据出错");
                }
            });
        },

        //重新获取某个collection下hars时重建列表
        rebuildCollectionTree:function(cid, hars){
            $("#my-collection-li-"+cid+" ul").remove();
            var html ='<ul>';
            for(var i in hars){
                var h = hars[i];
                html+='<li><a href="javascript:void(0);" data-id="'+ h.harId+'" class="my-har-a">'+ h.name +'</a></li>';
            }
            html+='</ul>';
            $("#my-collection-li-"+cid).append(html);
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

        highlightCode : function (){
            $('pre code').each(function(){
                hljs.highlightBlock($(this)[0]);
            });
        },
    };
}(Moklr));
