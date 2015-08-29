var path = require('path');

module.exports = {
    port: 8001,
    viewEngine: 'ejs',
    sessionSecret: 'session_secret_random_seed_for_test',

    views: 'views',
    staticPath: 'public',//静态资源目录
    uploadDir: 'public/uploads',//注意：要首先建立该文件夹，并做好权限

    env: 'test',

    log:{
        persist: true,//是否开启日志的持久化，即记录到日志文件
        logfile: '/dmdata/logs/moklr.log'//persist为true时有效
    },



    //mysql config
    //mysql: {
    //    host: "192.168.100.182",
    //    user: "dmdevelop",
    //    password: "develop@dm.com",
    //    db: "relation"
    //},

    //redis config
    //"redis": {"address": "192.168.100.185", "port": "6379", "passwd": ""},

    mongodb: {
        address: "mongodb://192.168.100.186:20301/moklr_online"
    },

    //moklr的status服务需要runbot来做指定http api的定期check，若不需要status服务可不开启此功能
    //runbot服务需单独部署，详见https://github.com/sumory/runbot
    runbot: {
        on: true,//是否开启runbot支持
        address:"http://192.168.100.122:8002"//若on为true，即开启runbot服务，这里配置runbot服务的http地址
    }

};
