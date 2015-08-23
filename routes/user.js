var express = require('express');
var router = express.Router();
var moklrModel = require('../models/moklrModel.js');
var commonUtils = require('../lib/utils.js');
var util = require('util');
var queryString  = require('querystring');
var urlUtil = require('url');
var async=require('async');

var logger = require('../lib/log.js').logger('userRouter');

//去往用户首页
router.get('/profile', commonUtils.checkLogin, function (req, res, next) {
    var uid = req.session.user.userId;

    moklrModel.findCollections(uid, function (err, cs) {
        res.render('profile', {
            collections: cs
        });
    });
});

router.get('/hars', commonUtils.checkLoginAjax, function (req, res, next) {
    var cid = req.query.cid;

    moklrModel.findHarsOfCollection(cid, function (err, hars) {
        if (err) {
            return res.json({
                success: false,
                msg: "获取hars出错"
            });
        } else {
            return res.json({
                success: true,
                msg: "ok",
                data: hars
            });
        }
    });
});

router.get('/har', commonUtils.checkLoginAjax, function (req, res, next) {
    var hid = req.query.hid;

    moklrModel.findHar(hid, function (err, hars) {
        if (err) {
            return res.json({
                success: false,
                msg: "获取hars出错"
            });
        } else {
            return res.json({
                success: true,
                msg: "ok",
                data: hars
            });
        }
    });
});

router.post('/har/addHarToCollection', commonUtils.checkLoginAjax, function (req, res, next) {
    var collectionId = req.body.collectionId;
    var har = req.body.har;
    var name = req.body.name;
    var uid = req.session.user.userId;

    moklrModel.createHar(uid, collectionId, name, har, function (err, newHar) {
        if (err) {
            return res.json({
                success: false,
                msg: "创建collection出错"
            });
        } else {
            return res.json({
                success: true,
                msg: "ok",
                data: newHar
            });
        }
    });
});

//修改har
router.post('/har/save', commonUtils.checkLoginAjax, function (req, res, next) {
    var harName = req.body.harName;
    var harId = req.body.harId;
    var harContent = req.body.harContent;
    var uid = req.session.user.userId;

    moklrModel.updateHar(uid, harId, harName, harContent, function (err, result) {
        if (err) {
            return res.json({
                success: false,
                msg: "修改har出错"
            });
        } else {
            return res.json({
                success: true,
                msg: "ok",
                data: result
            });
        }
    });
});

router.post('/har/delete', commonUtils.checkLoginAjax, function (req, res, next) {
    var harId = req.body.harId;
    var uid = req.session.user.userId;

    moklrModel.deleteHar(uid, harId, function (err, result) {
        if (err) {
            return res.json({
                success: false,
                msg: "删除har出错"
            });
        } else {
            return res.json({
                success: true,
                msg: "ok",
                data: result
            });
        }
    });
});

router.post('/collection/create', commonUtils.checkLoginAjax, function (req, res, next) {
    var name = req.body.name;
    var uid = req.session.user.userId;

    moklrModel.createCollection(uid, name, function (err, result) {
        if (err) {
            return res.json({
                success: false,
                msg: "创建collection出错"
            });
        } else {
            return res.json({
                success: true,
                msg: "ok",
                data: result
            });
        }
    });
});


router.post('/collection/edit', commonUtils.checkLoginAjax, function (req, res, next) {
    var cid = req.body.id;
    var newName = req.body.name;
    var uid = req.session.user.userId;

    moklrModel.updateCollection(uid, cid, newName, function (err, result) {
        if (err) {
            return res.json({
                success: false,
                msg: "修改collection名称出错"
            });
        } else {
            return res.json({
                success: true,
                msg: "ok",
                data: result
            });
        }
    });
});

router.post('/collection/import', commonUtils.checkLoginAjax, function (req, res, next) {
    var cid = req.body.id;
    var content = JSON.parse(req.body.content);
    var uid = req.session.user.userId;

    if (!util.isObject(content) || !content.requests) {
        return res.json({
            success: false,
            msg: "wrong content format."
        });
    }

    logger.info("导入collection:", content);
    var requests = content.requests;
    var hars =[];

    for (var i in requests) {
        var toImport = false;
        var r = requests[i];
        var name = r.name;

        try{
            var queryString=[];
            var urlObject = urlUtil.parse(r.url,true);
            if(urlObject&& urlObject.query){
                for(var q in urlObject.query){
                    if(q){
                        queryString.push({
                            name: q,
                            value: urlObject.query[q]
                        });
                    }
                }
            }

            var headers = [];
            var headersArray = r.headers.split("\n");
            for(var h in headersArray){
                var h = headersArray[h];
                if(h){
                    var ha = h.split(":");
                    if(ha&&ha.length>1&&ha[0]){
                        headers.push({
                            name: ha[0],
                            value:ha[1]||""
                        });
                    }
                }
            }
            var har ={};

            if (r.method === "GET") {
                har = {
                    "method": "GET",
                    "url": r.url,
                    "httpVersion": "HTTP/1.1",
                    "queryString": queryString,
                    "headers": headers,
                    "cookies": []
                };
                toImport=true;
            }
            else if (r.method === "POST" && r.dataMode==="raw") {
                har = {
                    "method": "POST",
                    "url": r.url,
                    "httpVersion": "HTTP/1.1",
                    "queryString":queryString,
                    "headers": headers,
                    "postData": {
                        "mimeType": "application/json",
                        "text": r.data.replace(/\n/g, "").replace(/\t/g, "").replace(/\r\n/g, "")
                    },
                    "cookies": []
                };
                toImport=true;
            }
            else if (r.method === "POST" && r.dataMode==="urlencoded") {
                var params = [];
                for(var j in r.data){
                    params.push({
                        name: r.data[j].key,
                        value: r.data[j].value
                    });
                }

                har = {
                    "method": "POST",
                    "url": r.url,
                    "httpVersion": "HTTP/1.1",
                    "queryString": queryString,
                    "headers": headers,
                    "postData": {
                        "mimeType": "application/x-www-form-urlencoded",
                        "params": params
                    },
                    "cookies": []
                };
                toImport=true;
            }else{
                log.error("要导入的某个request格式错误", r);
                toImport=false;
            }

            if(toImport){
                hars.push({
                    name:name,
                    har:har
                });
            }
        }catch(e){
            logger.error("处理导入出错", name, r);
        }
    }


    async.map(hars, function(har, callback){
        moklrModel.createHar(uid,cid, har.name, har.har, function(err, result ){
            callback(err,result);
        });
    }, function(err, results){
        if(err){
            return  res.json({
                success: false,
                msg: err
            });
        }
        return res.json({
            success: true,
            msg: "导入结束，请检查"
        });
    });
});

router.post('/collection/delete', commonUtils.checkLoginAjax, function (req, res, next) {
    var cid = req.body.id;
    var uid = req.session.user.userId;

    moklrModel.deleteCollection(uid, cid, function (err, result) {
        if (err) {
            return res.json({
                success: false,
                msg: "删除collection出错"
            });
        } else {
            return res.json({
                success: true,
                msg: "ok",
                data: result
            });
        }
    });
});


router.post('/save', function (req, res, next) {
    var name = req.body.name;
    var age = req.body.age;
    var sex = req.body.sex;

    console.log(name, age, sex)

    return res.json({
        name: name,
        age: age,
        sex: sex
    });
});

module.exports = router;
