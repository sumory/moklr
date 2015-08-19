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
