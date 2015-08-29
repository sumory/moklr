var express = require('express');
var router = express.Router();
var moklrModel = require('../models/moklrModel.js');
var commonUtils = require('../lib/utils.js');
var util = require('util');
var queryString = require('querystring');
var urlUtil = require('url');
var async = require('async');
var request = require("request");
var config = require("../config");

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
        if (isNaN(cron)) {
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
    if (monitor == true || monitor == 'true') {
        monitor = true;
    } else {
        monitor = false;
    }

    try {
        if (isNaN(cron)) {
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
            if (config.runbot.on) {//开启了status服务（定期请求并记录日志）
                console.log("开始触发runbot命令", (monitor === true ? "start" : "stop"), statusAPIId);
                var options = {
                    "method": "GET",
                    "url": config.runbot.address + "/" + (monitor === true ? "start" : "stop") + "?statusAPIId=" + statusAPIId
                };

                request(options, function (error, response, body) {
                    console.log("========");
                    console.log("error: ", error);
                    console.log("response: ", response && (response.statusCode || ""));
                    console.log("++++++++");

                    if (!error && response && response.statusCode == 200) {
                        var r = JSON.parse(body);
                        if (r.success) {
                            return res.json({
                                success: true,
                                msg: "ok",
                                data: result
                            });
                        } else {
                            return res.json({
                                success: false,
                                msg: r.msg
                            });
                        }
                    } else {
                        return res.json({
                            success: false,
                            msg: "修改status api成功，但触发执行runbot失败，请检查"
                        });
                    }
                });
            } else {
                return res.json({
                    success: true,
                    msg: "ok",
                    data: result
                });
            }
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


router.get('/api/logs', commonUtils.checkLoginAjax, function (req, res, next) {
    var statusAPIId = req.query.statusAPIId;
    var uid = req.session.user.userId;
    var limit = 100;

    moklrModel.findStatusAPILogs(statusAPIId, limit, function (err, result) {
        if (err) {
            return res.json({
                success: false,
                msg: "获取status api logs出错"
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

router.post('/api/logs/delete', commonUtils.checkLoginAjax, function (req, res, next) {
    var statusAPIId = req.body.statusAPIId;
    var uid = req.session.user.userId;

    moklrModel.deleteStatusAPILogs(uid, statusAPIId, function (err, result) {
        if (err) {
            return res.json({
                success: false,
                msg: "删除status api logs出错"
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
