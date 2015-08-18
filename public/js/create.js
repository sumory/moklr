(function(L) {
    var _this = null;
    L.Common = L.Common || {};
    _this = L.Common = {
        data : {
            codes:{},
            selectedL:'python',
            selectedLL:'requests'
        },
        init : function() {
            //点击“加号“添加新的输入行
            $('form').on('click', '.form-group.pair:last-of-type .btn-success', _this.addKeyPair);

            //点击最后一个输入行时添加一个新的输入行
            $('form').on('focus', '.form-group.pair:last-child input', _this.addKeyPair);

            //删除输入行
            $('form').on('click', '.form-group.pair .btn-danger', function(event) {
                $(this).parents('.form-group').remove();//删除本行输入
                _this.rebuildUrl();//重新构建url
                _this.processFormData();
            });

            //所有输入框事件
            $('form[name!=url]').on('keyup keypress change blur', '.form-control', function(event){
                _this.rebuildUrl();
                _this.processFormData();
            });

            //方法下拉框事件
            $('select[name="method"]').on('change',function(e) {
                if($(this).val()=='GET'){
                    $("form[name=postData-params]").hide();
                    $('div[id=for-post-header]').remove();
                }else if($(this).val()=='POST'){
                    $("form[name=postData-params]").show();

                    var toAddForPost ='<div class="form-group pair" id="for-post-header">';
                    toAddForPost +='<div class="input-group multi">';
                    toAddForPost +='<span class="input-group-addon">Header</span>';
                    toAddForPost +='<input type="text" name="name" value="Content-type" placeholder="name" required="" class="form-control">';
                    toAddForPost +='<input type="text" name="value" value="application/x-www-form-urlencoded" placeholder="value" class="form-control">';
                    toAddForPost +=' <span class="input-group-btn">';
                    toAddForPost +='<button type="button" tabindex="-1" class="btn btn-success">';
                    toAddForPost +='<i class="glyphicon glyphicon-plus"></i>';
                    toAddForPost +='</button>';
                    toAddForPost +=' <button type="button" tabindex="-1" class="btn btn-danger">';
                    toAddForPost +='<i class="glyphicon glyphicon-remove"></i>';
                    toAddForPost +='</button>';
                    toAddForPost +='</span>';
                    toAddForPost +='</div>';
                    toAddForPost +='</div>';
                    $('form[name=headers] h4').after( toAddForPost);
                }

                _this.processFormData();
            });

            //post类型下拉框事件
            $("select[name=postData-mimeType]").on('change', function(e){
                var thisValue = $(this).val();
                if(thisValue === 'application/x-www-form-urlencoded' || thisValue === "multipart/form-data"){
                    $("#postData-params").show();
                    $("#postData-text").hide();
                }else if(thisValue === 'application/json'){
                    $("#postData-params").hide();
                    $("#postData-text").show();
                }

                //将header头的content-type设为变化后的值
                $("#for-post-header input[name=value]").val(thisValue);
                _this.processFormData();
            });

            //QueryString的各个输入框的监控事件
            $('form[name=queryString]').on('keyup keypress change blur', '.form-control', function(e){
                _this.rebuildUrl();
                _this.processFormData();
            });

            //url输入框的监控事件
            $("body").on('keyup keypress change blur', 'input[name=url]', function(){
                _this.rebuildQueryString();//重新构建QueryString的一坨输入框
                _this.processFormData();
            });

            //textarea监控事件
            $("body").on("keyup keypress change blur", 'textarea', function(){
               _this.processFormData();
            });


            $("#submitBtn").click(function(){
                $("#codeArea").show();
                $("#execArea").hide();
                _this.processFormData(true);
                return false;
            });

            $("#downloadCodeBtn").click(function(){
                _this.downloadCode();
            });

            //大网页极易卡住CPU，待排查
            $("#runCodeBtn").click(function(){
                var har = _this.getHar();
               // har = JSON.( JSON.stringify(har));
                //console.log("运行har:", har);
                $.ajax({
                    type: "get",  //提交方式
                    url: "/run/exec",//路径
                    data: {
                        r: har
                    },
                    success: function (result) {//返回数据根据结果进行相应的处理
                        if (result.success) {
                            $("#codeArea").hide();
                            $("#execArea").show();
                            var body = result.data.body;
                            try{
                                //if(typeof body === 'object')
                                    body = JSON.stringify(JSON.parse(body), null, 2);
                            }catch(e){

                            }
                            $("#execArea pre code").text("//Http StatusCode:"+result.data.responseStatus+"\n\n"+body);
                            _this.highlightCode();
                            delete result.data.body
                        } else {
                            $("#codeArea").hide();
                            $("#execArea").show();
                            if(result.errorCode==1)
                                $("#execArea pre code").html("【构建的请求格式有误，请检查输入项】"+result.msg);
                            else if(result.errorCode ==2)
                                $("#execArea pre code").html("【执行代码发送http请求失败】"+result.msg);
                            else
                                $("#execArea pre code").html("【其它错误】"+result.msg);
                        }
                    }
                });
            });

            $("body").on("click",".code-select-li", function(){
                var k1 = $(this).attr('data-k1');
                var k2 = $(this).attr('data-k2');
                _this.selectCode(k1,k2);
            });


            //var myURL = parseURL('http://sumory.com:80/test/index.xyz?name=s&age=18#abc');
            //console.dir(myURL)

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

        getHar : function(){
            var isGet = true;
            var methodInput = $('select[name="method"]').val();
            if (methodInput == 'GET') {
                isGet = true;
                $("form[name=postData-params]").hide();
            } else if (methodInput == 'POST') {
                isGet = false;
                $("form[name=postData-params]").show();
            }


            var url = $("input[name=url]").val();


            var response = {//初始化
                method: 'GET',
                url: '',
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

            var forms = [{
                form: 'method',
                parent: response
            }, {
                form: 'url',
                parent: response
            }];

            forms.forEach(function (item) {
                $('form[name="' + item.form + '"] div.form-group:not(.pair) .form-control').each(function () {
                    var self = $(this);
                    item.parent[self.attr('name')] = self.val();
                })
            });

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
                        var tmp =$("#postData-text textarea").val().replace(/\n/g,"");
                        var postDataText = JSON.parse( JSON.stringify(tmp));
                        response['postData'].text =postDataText;
                    }
                    catch(e){
                        console.error(e);
                        $("#postData-text span").text("输入的数据须为json类型");
                        response['postData'].text ={};
                    }
                }
            }

            return response;
        },

        processFormData : function(isSubmit) {
            var url = $("input[name=url]").val();
            if (isSubmit && (url == '' || url.indexOf('http') == -1 )) {
                alert("url不能为空");
                return;
            }

            var response = _this.getHar();
            $('#preview pre code').text(JSON.stringify(response, null, 2));
            _this.highlightCode();

            if (isSubmit) {
                $("#codeArea").hide();
                $("#preview_code pre code").empty();
                $("#selectedLanguage").text("");

                $.ajax({
                    type: "POST",  //提交方式
                    url: "/mock/create",//路径
                    dataType: "json",
                    data: {
                        "response": JSON.stringify(response, null, 2)
                    },
                    success: function (result) {//返回数据根据结果进行相应的处理
                        if (result.success) {
                            $("#codeArea").show();
                            $.ajax({
                                type: "GET",  //提交方式
                                url: "/mock/gen",//路径
                                data: {
                                    "uuid": result.data.id
                                },
                                success: function (result) {//返回数据根据结果进行相应的处理
                                    _this.data.codes = result.output;
                                    _this.initCodes(result.output);
                                }
                            });

                        } else {
                            $("#codeArea").hide();
                            alert("提交失败");
                        }
                    }
                });
            }
        },


        initCodes : function(codes){
            $("#lDropdownList").html("");
            Object.keys(codes).forEach(function(k){
                var l = k;
                var ll = codes[k];
                Object.keys(ll).forEach(function(kk){
                    var name = k+"-"+kk;
                    $("#lDropdownList").append('<li id="li_' +name+ '"><a href="javascript:void(0)" class="code-select-li" data-k1="' + k+ '" data-k2="' +kk+ '">' + name+ '</a></li>')
                });
            });

            try{
               _this.selectCode("python","requests");
            }catch(e){
                console.error(e);
            }
        },

        selectCode: function(k1,k2){
            console.log("show code:", k1, k2);
            _this.data.selectedL=k1;
            _this.data.selectedLL=k2;
            $("#selectedLanguage").text("【" + k1 +"】 "+k2);
            $("#preview_code pre code").html(_this.data.codes[k1][k2]);
            _this.highlightCode();

        },

        highlightCode : function (){
            $('pre code').each(function(){
                hljs.highlightBlock($(this)[0]);
            });
        },

        downloadCode: function(){
            var l = _this.data.selectedL;
            var ll = _this.data.selectedLL;
            if(!l || !ll ){
                alert("请选择具体语言");
                return;
            }
            var suffix = '.txt';

            switch (l){
                case "python":
                    suffix = '.py';
                    break;
                case "java":
                    suffix = ".java";
                    break;
                case "go":
                    suffix = ".go";
                    break;
                case "php":
                    suffix=".php";
                    break;
                case "shell":
                    suffix = ".sh";
                    break;
                case "ruby":
                    suffix = ".rb";
                    break;
                case "node":
                    suffix = ".js";
                    break;
                case "javascript":
                    suffix = ".js";
                    break;
                case "csharp":
                    suffix = ".cs";
                    break;
            }

            if(_this.data.codes && _this.data.codes[l] && _this.data.codes[l][ll]){
                var code = _this.data.codes[l][ll];
                var blob = new Blob([code], {type: "text/plain;charset=utf-8"});
                saveAs(blob, l+suffix);
            }else{
                alert("没有任何代码可供下载");
                return;
            }

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
        },

        rebuildUrl : function (){
            var url = $("input[name=url]").val();

            var query="";
            $('form[name=queryString] .pair input[name="name"]').slice(0, -1).each(function(index, header) {
                var name = $(header).val();

                if (name.trim() !== '') {
                    var value = $(this).next().val();//获取兄弟节点即value节点
                    query+=""+name+"="+value+"&";
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
        },

        //重新构建QueryString的多个输入框
        rebuildQueryString: function (){
            var url = $("input[name=url]").val();
            var params = _this.parseURL(url).params;
            $("form[name=queryString]").html('<h4>QueryString</h4>');

            if(Object.keys(params).length==0){//没有参数，则初始化一个空行
                var node="";
                node += '<div class="form-group pair">';
                node += '<div class="input-group multi">';
                node += '<span class="input-group-addon">Query &nbsp;</span>';
                node += '<input type="text" name="name" value="" placeholder="name" required="" class="form-control">';
                node += '<input type="text" name="value" value="" placeholder="value" class="form-control">';
                node += '<span class="input-group-btn">';
                node += '<button type="button" tabindex="-1" class="btn btn-success">';
                node += '<i class="glyphicon glyphicon-plus"></i>';
                node += '</button>';
                node += '<button type="button" tabindex="-1" class="btn btn-danger">';
                node += '<i class="glyphicon glyphicon-remove"></i>';
                node += '</button>';
                node += '</span>';
                node += '</div>';
                node += '</div>';

                $("form[name=queryString]").append(node);
            }
            else{
                Object.keys(params).forEach(function(k){
                    var node ="";

                    if(k && params[k]) {
                        node += '<div class="form-group pair">';
                        node += '<div class="input-group multi">';
                        node += '<span class="input-group-addon">Query &nbsp;</span>';
                        node += '<input type="text" name="name" value="' + k + '" placeholder="name" required="" class="form-control">';
                        node += '<input type="text" name="value" value="' + (params[k] ? params[k] : "") + '" placeholder="value" class="form-control">';
                        node += '<span class="input-group-btn">';
                        node += '<button type="button" tabindex="-1" class="btn btn-success">';
                        node += '<i class="glyphicon glyphicon-plus"></i>';
                        node += '</button>';
                        node += '<button type="button" tabindex="-1" class="btn btn-danger">';
                        node += '<i class="glyphicon glyphicon-remove"></i>';
                        node += '</button>';
                        node += '</span>';
                        node += '</div>';
                        node += '</div>';

                        $("form[name=queryString]").append(node);
                    }
                });

                //点击最后一行，触发产生一个新的空输入行
                $('form[name=queryString] .form-group.pair:last-of-type .btn-success').click();
            }
        }
    };
}(Moklr));
