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
            har = JSON.stringify(har, null ,2);
            $("#selected_har_code").text(har);
            _this.renderForm(har);
        },

        //初始化输入表单
        renderForm: function(har){
            var tpl = $("#harform-tpl").html();
            var html = juicer(tpl, har);

            $("#harform").html(html);
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
        }
    };
}(Moklr));
