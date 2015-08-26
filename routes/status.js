var express = require('express');
var router = express.Router();
var moklrModel = require('../models/moklrModel.js');
var commonUtils = require('../lib/utils.js');
var util = require('util');
var queryString = require('querystring');
var urlUtil = require('url');
var async = require('async');

var logger = require('../lib/log.js').logger('statusRouter');

//去往用户首页
router.get('/', commonUtils.checkLogin, function (req, res, next) {
    var uid = req.session.user.userId;
    res.render("status");
});

router.get('/hars', commonUtils.checkLoginAjax, function (req, res, next) {
    var uid = req.session.user.userId;

    moklrModel.findHarsOfUser(uid, function (err, hars) {
        if (err) {
            return res.json({
                success: false,
                msg: "获取用户的所有hars出错"
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

router.get('/apis', commonUtils.checkLoginAjax, function (req, res, next) {
    var uid = req.session.user.userId;

    moklrModel.findStatusAPIs(uid, function (err, apis) {
        if (err) {
            return res.json({
                success: false,
                msg: "获取用户的所有status api出错"
            });
        } else {
            return res.json({
                success: true,
                msg: "ok",
                data: apis
            });
        }
    });
});

router.get('/api', commonUtils.checkLoginAjax, function (req, res, next) {
    var uid = req.session.user.userId;
    var statusAPIId = req.query.statusAPIId;

    moklrModel.findStatusAPI(uid, statusAPIId, function (err, api) {
        if (err) {
            return res.json({
                success: false,
                msg: "获取status api出错"
            });
        } else {
            return res.json({
                success: true,
                msg: "ok",
                data: api
            });
        }
    });
});

//创建
router.post('/api/create', commonUtils.checkLoginAjax, function (req, res, next) {
    var har = req.body.har;
    var name = req.body.name;
    var uid = req.session.user.userId;
    var cron = req.body.cron;
    var monitor = req.body.monitor;

    try {
        if(isNaN(cron)){
            return res.json({
                success: false,
                msg: "cron must be number"
            });
        }
    } catch (e) {
        return res.json({
            success: false,
            msg: "cron must be number"
        });
    }

    moklrModel.createStatusAPI(uid, name, monitor || false, cron || "5", har, function (err, newStatusAPI) {
        if (err) {
            return res.json({
                success: false,
                msg: "创建出错"
            });
        } else {
            return res.json({
                success: true,
                msg: "ok",
                data: newStatusAPI
            });
        }
    });
});

//修改名称、时间间隔等
router.post('/api/modify', commonUtils.checkLoginAjax, function (req, res, next) {
    var statusAPIId = req.body.statusAPIId;
    var uid = req.session.user.userId;
    var cron = req.body.cron;
    var monitor = req.body.monitor;

    try {
        if(isNaN(cron)){
            return res.json({
                success: false,
                msg: "cron must be number"
            });
        }
    } catch (e) {
        return res.json({
            success: false,
            msg: "cron must be number"
        });
    }

    var name = req.body.name;

    moklrModel.modifyStatusAPI(uid, statusAPIId, name, monitor, cron, function (err, result) {
        if (err) {
            return res.json({
                success: false,
                msg: "修改出错"
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

router.post('/api/delete', commonUtils.checkLoginAjax, function (req, res, next) {
    var statusAPIId = req.body.statusAPIId;
    var uid = req.session.user.userId;

    moklrModel.deleteStatusAPI(uid, statusAPIId, function (err, result) {
        if (err) {
            return res.json({
                success: false,
                msg: "删除status api出错"
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


module.exports = router;
