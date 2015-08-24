var path = require('path');

module.exports = {
    port: 8001,
    viewEngine: 'ejs',
    sessionSecret: 'session_secret_random_seed_for_test',

    views: 'views',
    staticPath: 'public',//静态资源目录
    uploadDir: 'public/uploads',//注意：要首先建立该文件夹，并做好权限

    env: 'test',
    logfile: '/dmdata/logs/moklr.log',


    //mysql config
    mysql: {
        host: "192.168.100.182",
        user: "dmdevelop",
        password: "develop@dm.com",
        db: "relation"
    },

    //redis config
    "redis": {"address": "192.168.100.185", "port": "6379", "passwd": ""},

    "mongodb": {
        "address": "mongodb://192.168.100.186:20301/moklr_online"
    }

};
