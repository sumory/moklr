$(function() {

    $('select[name="method"]').on('change', function(e) {

        if($(this).val()=='GET'){
            console.log('GET');
            $("form[name=postData-params]").hide()
        }else if($(this).val()=='POST'){
            console.log('POST');
            $("form[name=postData-params]").show()
        }

        processFormData()
    });

    var addKeyPair = function(event) {
        var self = $(this);

        var group = self.parents('.form-group');
        var form = self.parents('form');

        group.clone().appendTo(form)
    };

    var processFormData = function(isSubmit) {
        var isGet =true;
        if($('select[name="method"]').val()=='GET'){
            isGet =true;
            $("form[name=postData-params]").hide()
        }else if($('select[name="method"]').val()=='POST'){
            isGet =false;
            $("form[name=postData-params]").show();
        }


        var url =$("input[name=url]").val();
        if(isSubmit&&(url=='' || url.indexOf('http')==-1 )){
            alert("url不能为空");
            return;
        }


        var response = {//初始化
            method: 'GET',
            url: '',
            httpVersion: 'HTTP/1.1',
            queryString: [],
            headers: [],
            cookies: [],
            postData: {
                mimeType: 'application/x-www-form-urlencoded',
                params: []
            }
        };


        var forms = [{
            form: 'method',
            parent: response
        }, {
            form: 'url',
            parent: response
        }];

        forms.forEach(function(item) {
            $('form[name="' + item.form + '"] div.form-group:not(.pair) .form-control').each(function() {
                var self = $(this);

                item.parent[self.attr('name')] = self.val();
            })
        });

        var groups = ['queryString', 'headers', 'cookies'];

        groups.forEach(function(pair) {
            var params = [];

            $('form[name="' + pair + '"] .pair input[name="name"]').slice(0, -1).each(function(index, header) {
                var value = $(header).val();

                if (value.trim() !== '') {
                    params.push({
                        name: value
                    })
                }
            });

            $('form[name="' + pair + '"] .pair input[name="value"]').slice(0, -1).each(function(index, header) {
                if (params[index]) {
                    params[index].value = $(header).val()
                }
            });

            response[pair] = params
        });


        if(isGet){
            delete response.postData;
        }else{
            var postData = 'postData-params';
            var postDataParams = [];

            $('form[name="' + postData + '"] .pair input[name="name"]').slice(0, -1).each(function(index, header) {
                var value = $(header).val();

                if (value.trim() !== '') {
                    postDataParams.push({
                        name: value
                    })
                }
            });

            $('form[name="' + postData + '"] .pair input[name="value"]').slice(0, -1).each(function(index, header) {
                if (postDataParams[index]) {
                    postDataParams[index].value = $(header).val()
                }
            })

            response['postData'].mimeType =$("select[name=mimeType]").val();
            response['postData'].params = postDataParams;
        }

        $('input[name="response"]').val(JSON.stringify(response));
        $('pre code').text(JSON.stringify(response, null, 2));

        hljs.highlightBlock($('pre code')[0]);

        if(isSubmit){
            $.ajax({
                type : "POST",  //提交方式
                url : "/mock/create",//路径
                data : {
                    "response" : $('input[name="response"]').val()
                },
                success : function(result) {//返回数据根据结果进行相应的处理
                    if ( result.success ) {
                        //window.location.href="/mock/"+result.data.id+"/view"

                        $.ajax({
                            type : "GET",  //提交方式
                            url : "/mock/gen",//路径
                            data : {
                                "uuid" : result.data.id
                            },
                            success : function(result) {//返回数据根据结果进行相应的处理
                                console.dir(result)

                                $('pre code').append('\n')
                                $('pre code').append(JSON.stringify(result.output, null, 2));

                                hljs.highlightBlock($('pre code')[0]);
                            }
                        });

                    } else {
                        alert("提交失败");
                    }
                }
            });
        }
    };



    $('form').on('click', '.form-group.pair:last-of-type .btn-success', addKeyPair);

    $('form').on('focus', '.form-group.pair:last-child input', addKeyPair);

    $('form').on('click', '.form-group.pair .btn-danger', function(event) {
        $(this).parents('.form-group').remove()
    });

    $('form').on('keyup keypress change blur', '.form-control', function(){
        processFormData();
    });


    $("#submitBtn").click(function(){
        processFormData(true);
        return false;
    });

    $(document).ready(function() {
        processFormData()
    })
});