var express = require('express');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var multiparty = require('multiparty');
var log4js = require('log4js');

var logger = require('./lib/log.js').logger('app');
var route = require('./route.js');
var config = require('./config');

var app = express();
app.set('env', config.env);
app.set('port', process.env.PORT||config.port);
app.set('views', config.views);
app.set('view engine', config.viewEngine);
app.use(expressSession({
    secret: config.sessionSecret,
    name: 'expressId', //种到cookies里的标识
    resave: false,
    saveUninitialized: true

}));
app.use(express.static(config.staticPath));
app.use(log4js.connectLogger(logger, {
    level: "auto"
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride());

app.use(function (req, res, next) {
    if(req && req.session && req.session.user){
        res.locals.isLogin = true;
        res.locals.loginUserId = req.session.user.userId;
        res.locals.loginUsername = req.session.user.username;
    }

    next();
});


route(app); //加载routes

//404错，即无匹配请求地址
app.use(function (req, res, next) {
    res.status(404);
    res.json({
        success: false,
        status: 404,
        msg: '404错误，找不到访问的资源(url)'
    });
});

//处理错误，返回响应
app.use(function (err, req, res, next) {
    var status = err.status || 500;
    logger.error('【error】', err.message || '', err.stack || '');
    res.status(status);
    res.json({
        success: false,
        status: status,
        msg: "服务端发生异常"
    });
});


var server = require('http').Server(app);
server.listen(app.get('port'), function () {
    console.log('Server listening on port ' + server.address().port, ', env is ' + app.get('env'));
});

process.on('uncaughtException', function (err) {
    console.log('Holy shit!!!!! Fatal Errors!!!!!!! ' + err);
});