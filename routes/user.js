var express = require('express');
var router = express.Router();
var moklrModel = require('../models/moklrModel.js');
var commonUtils = require('../lib/utils.js');

//去往用户首页
router.get('/profile', commonUtils.checkLogin,  function(req, res, next) {
    var uid = req.session.user.userId;

    moklrModel.findCollections(uid, function(err, cs){
       res.render('profile',{
           collections: cs
       });
    });
});

router.get('/hars', commonUtils.checkLoginAjax,  function(req, res, next) {
    var cid = req.query.cid;

    moklrModel.findHarsOfCollection(cid,function(err, hars){
        if(err){
            return res.json({
                success:false,
                msg:"获取hars出错"
            });
        }else{
            return res.json({
                success:true,
                msg:"ok",
                data: hars
            });
        }
    });
});

router.get('/har', commonUtils.checkLoginAjax,  function(req, res, next) {
    var hid = req.query.hid;

    moklrModel.findHar(hid,function(err, hars){
        if(err){
            return res.json({
                success:false,
                msg:"获取hars出错"
            });
        }else{
            return res.json({
                success:true,
                msg:"ok",
                data: hars
            });
        }
    });
});

router.post('/har/addHarToCollection', commonUtils.checkLoginAjax,  function(req, res, next) {
    var collectionId = req.body.collectionId;
    var har = req.body.har;
    var name = req.body.name;
    var uid = req.session.user.userId;

    moklrModel.createHar(uid,collectionId, name,har, function(err,newHar){
        if(err){
            return res.json({
                success:false,
                msg:"创建collection出错"
            });
        }else{
            return res.json({
                success:true,
                msg:"ok",
                data: newHar
            });
        }
    });
});

//修改har
router.post('/har/save', commonUtils.checkLoginAjax,  function(req, res, next) {
    var harName = req.body.harName;
    var harId = req.body.harId;
    var harContent = req.body.harContent;
    var uid = req.session.user.userId;

    moklrModel.updateHar(uid, harId,harName, harContent,  function(err,result){
        if(err){
            return res.json({
                success:false,
                msg:"修改har出错"
            });
        }else{
            return res.json({
                success:true,
                msg:"ok",
                data: result
            });
        }
    });
});

router.post('/har/delete', commonUtils.checkLoginAjax,  function(req, res, next) {
    var harId = req.body.harId;
    var uid = req.session.user.userId;

    moklrModel.deleteHar(uid, harId,  function(err,result){
        if(err){
            return res.json({
                success:false,
                msg:"删除har出错"
            });
        }else{
            return res.json({
                success:true,
                msg:"ok",
                data: result
            });
        }
    });
});

router.post('/collection/create', commonUtils.checkLoginAjax,  function(req, res, next) {
    var name = req.body.name;
    var uid = req.session.user.userId;

    moklrModel.createCollection(uid, name, function(err,result){
        if(err){
            return res.json({
                success:false,
                msg:"创建collection出错"
            });
        }else{
            return res.json({
                success:true,
                msg:"ok",
                data: result
            });
        }
    });
});


router.post('/collection/edit', commonUtils.checkLoginAjax,  function(req, res, next) {
    var cid = req.body.id;
    var newName = req.body.name;
    var uid = req.session.user.userId;

    moklrModel.updateCollection(uid, cid, newName,  function(err,result){
        if(err){
            return res.json({
                success:false,
                msg:"修改collection名称出错"
            });
        }else{
            return res.json({
                success:true,
                msg:"ok",
                data: result
            });
        }
    });
});

router.post('/collection/delete', commonUtils.checkLoginAjax,  function(req, res, next) {
    var cid = req.body.id;
    var uid = req.session.user.userId;

    moklrModel.deleteCollection(uid, cid, function(err,result){
        if(err){
            return res.json({
                success:false,
                msg:"删除collection出错"
            });
        }else{
            return res.json({
                success:true,
                msg:"ok",
                data: result
            });
        }
    });
});


router.post('/save', function(req, res, next){
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
