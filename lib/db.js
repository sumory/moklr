var mysql = require("mysql");
var config = require("../config");
var logger = require('./log.js').logger('db');
var commonUtils = require("./utils.js");
var utils = require("util");

var pool;//mysql connection pool


exports.init = function(){
    if(!pool){
        pool = mysql.createPool({
            connectionLimit: 50,
            host: config.mysql.host,
            user: config.mysql.user,
            password: config.mysql.password,
            database: "",
            supportBigNumbers: true, //dealing with big numbers as a string
            acquireTimeout: 6000,
            waitForConnections: false //发现连接不可用，立刻回调错误
            //debug: true
        });

        pool.on('connection', function (connection) {
            logger.info("新的数据库连接被创建", connection.threadId);
        });
    }
};



/**
 * 获取连接
 *
 * @param callback
 */
exports.getConnection = function (callback) {
    pool.getConnection(callback);//无论任何情况必选保证connection调用release
};

/**
 * 执行sql查询
 * 要确保严格有三个参数，最后一个为callback，中间params不能省略
 *
 * @param sql
 * @param params
 * @param callback
 */
exports.query = function (sql, params, callback) {
    var trackId = commonUtils.rd();//生成一个追踪id，用于排查问题
    logger.info(trackId, "进入query：", sql, params);
    if (!utils.isArray(params)) {
        logger.error(trackId, "query参数不是数组，退出sql执行");
        callback && callback(new Error("请确保query参数必须是数组"), null);
        return;
    }

    pool.getConnection(function (err, connection) {
        logger.info(trackId, "尝试拿到连接", err == null ? "成功" : "失败");
        if (err) {
            try {
                if (connection)
                    connection.release();
            } catch (e) {
                logger.error(trackId, "拿连接出错，尝试释放出错", err, connection);
            }
            callback && callback(err, null);
        } else {
            logger.info(trackId, '连接id为' + connection.threadId);
            connection.query(sql, params, function (err, data) {
                logger.info(trackId, '连接将被释放 ', connection.threadId);
                connection.release();
                logger.info(trackId, '连接已释放');
                if (err) {
                    logger.error(trackId, err);
                }
                callback && callback(err, data);
            });
        }
    });
};

