var crypto = require('crypto');
var uuid = require('node-uuid');

exports.checkLogin = function (req, res, next) {
    if (req && req.session && req.session.user) {
        next();
    } else {
        res.render('error', {
            msg: '请先登录再执行相关操作',
            nologin: true
        });
        return;
    }
};

exports.checkLoginAjax = function (req, res, next) {
    if (req && req.session && req.session.user) {
        next();
    } else {
        return res.json( {
            success:false,
            msg: '请先登录再执行相关操作'
        });
    }
};

exports.md5 = function (str, salt) {
    var md5sum = crypto.createHash("md5");
    if (salt)
        md5sum.update( str+salt,"utf-8");//记得添加‘utf-8’
    else
        md5sum.update(str,"utf-8");
    str = md5sum.digest("hex");
    return str;
};

exports.getUUID = function(){
    return uuid.v4();
};

exports.rd = function(){
    return Math.floor(Math.random()*100000+1);
}

//console.log(exports.md5("123456","-abc"));
//console.log(exports.getUUID());

