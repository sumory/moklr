var express = require('express');
var router = express.Router();
var moklrModel = require('../models/moklrModel.js');
var logger = require('../lib/log.js').logger('authRouter');

router.get('/login', function (req, res, next) {
    res.render('login');
});

router.get('/logout', function (req, res, next) {
    req.session.destroy();
    res.render('login');
});

router.post('/login', function (req, res, next) {
    try {
        var password = req.body.password.trim();
        var username = req.body.username.trim();

        if (!username) {
            res.render('error', {
                msg: "用户名不能为空"
            });
            return;
        }
        if (!password) {
            res.render('error', {
                msg: "密码不能为空"
            });
            return;
        }

        moklrModel.findUser(username, password, function (err, user) {
            if (err || !user) {
                logger.error(err);
                return res.render('error', {
                    msg: "查找用户出错或用户不存在"
                });
            }

            req.session.user = user;
            res.redirect("/user/profile");
        });
    } catch (e) {
        logger.error(e);
        res.render('error', {
            msg: "登录发生异常"
        });
    }
});

module.exports = router;