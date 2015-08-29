var log4js = require('log4js');
var logConfig = require('../config').log;

if (logConfig.persist) {
    log4js.configure({
        appenders: [{//控制台输出
            type: 'console'
        }, {
            type: 'file', //文件输出
            filename: logConfig.logfile,
            //maxLogSize: 20480, //当超过maxLogSize大小时，会自动生成一个新文件
            //backups: 3
            pattern: "-yyyy-MM-dd",
            alwaysIncludePattern: true
        }],
        replaceConsole: true //增加replaceConsole配置，让所有console输出到日志中，以[INFO] console代替console默认样式。
    });
} else {
    log4js.configure({
        appenders: [{//控制台输出
            type: 'console'
        }],
        replaceConsole: true //增加replaceConsole配置，让所有console输出到日志中，以[INFO] console代替console默认样式。
    });
}


exports.logger = function (name, level) {
    var logger = log4js.getLogger(name);
    logger.setLevel(level || 'INFO');
    return logger;
};