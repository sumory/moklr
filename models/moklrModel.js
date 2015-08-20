var mongoose = require('mongoose');
var config = require('../config');
var uuid = require('node-uuid');
var logger = require('../lib/log.js').logger('moklrModel');

mongoose.connect(config.mongodb.address);
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    userId: {type: String, index: true},
    username: {type: String, index: true, unique: true},
    pwd: String,
    date: {type: Date, default: Date.now}
});
//建立唯一性索引
// db.user.ensureIndex({username:1},{unique:true})

UserSchema.statics.findbyUsername = function (username, callback) {
    return this.model('User').find({username: username}, callback);
};

var CollectionSchema = new Schema({
    collectionId: {type: String, index: true},
    userId: {type: String, index: true},
    name: String,
    date: {type: Date, default: Date.now}
});

CollectionSchema.statics.findAllByUserId = function (userId, callback) {
    return this.model('Collection').find({userId: userId}, callback);
};

var HarSchema = new Schema({
    harId: {type: String, index: true},
    userId: {type: String, index: true},
    collectionId: {type: String, index: true},
    name: String,
    content: {},
    date: {type: Date, default: Date.now}
});

var User = mongoose.model('User', UserSchema, "user");
var Collection = mongoose.model('Collection', CollectionSchema, "collection");
var Har = mongoose.model('Har', HarSchema, "har");


//~========== methods =================
function genId() {
    return uuid.v4();
}

//生成id
exports.genId = genId;

//创建用户,同时创建一个默认的集合
exports.createUser = function (user, callback) {
    var userId = genId();
    user.userId = userId;
    var u = new User(user);
    u.save(function (err, u) {
        if (err) {
            logger.error("创建用户失败", err, u);
            return callback(new Error("创建用户失败"));
        }

        if (u)
            exports.createCollection(userId, "Default", callback);
        else
            callback(new Error("无法保存用户"));
    })

};

//创建集合
exports.createCollection = function (uid, name, callback) {
    var collectionId = genId();
    var collection = new Collection({
        collectionId: collectionId,
        userId: uid,
        name: name
    });
    collection.save(callback);
};

//创建一个har，它属于一个集合
exports.createHar = function (uid, collectionId, name, har, callback) {
    if (!uid || !collectionId) {
        callback && callback(new Error("必须指定uid和collectionId"));
        return;
    }
    var harId = genId();
    var har = new Har({
        harId: harId,
        userId: uid,
        collectionId: collectionId,
        name: name,
        content: har
    });

    Collection.findOne({collectionId: collectionId}, function (err, c) {
        if (err || !c) {
            return callback(new Error("无法找到collection"));
        }

        har.save(callback);
    });
};

//查找用户
exports.findUser = function (username, pwd, callback) {
    User.findOne({username: username, pwd: pwd}, callback);
};

//查找某用户的所有collection
exports.findCollections = function (uid, callback) {
    Collection.find({userId: uid}).sort({'_id': -1}).exec(callback);
};

//查询一个collection下的所有har
exports.findHarsOfCollection = function (cid, callback) {
    Har.find({collectionId: cid}).sort({'_id': -1}).exec(callback);
};

exports.findHar = function (hid, callback) {
    Har.findOne({harId: hid}).exec(callback);
};


//删除collection
exports.deleteCollection = function (uid, cid, callback) {

    Collection.remove({userId: uid, collectionId: cid}, function (err, result) {
        if (err) {
            return callback(new Error("删除collection失败"));
        }
        Har.remove({userId: uid, collectionId: cid}, function (err, result) {
            callback(err);
        });
    });
};

//删除har
exports.deleteHar = function (uid, hid, callback) {
    Har.remove({userId: uid, harId: hid}, callback);
};

//更新har
exports.updateHar = function(userId, harId, harName, harContent, callback){
    var conditions = {harId : harId, userId:userId};
    var update     = {$set : {content : harContent, name:harName, date : Date.now()}};
    var options    = {upsert : false};
    Har.update(conditions, update, options,callback);
};


//更collection name
exports.updateCollection = function(userId, collectionId, newName, callback){
    var conditions = {collectionId : collectionId, userId:userId};
    var update     = {$set : {name:newName, date : Date.now()}};
    var options    = {upsert : false};
    Collection.update(conditions, update, options,callback);
};

function Callback(err, result) {
    console.log(err, result);
}

function test() {
    //exports.findCollections("1", function(err, result){
    //    console.log(err, result);
    //})

    //exports.findHarsOfCollection("1", function (err, result) {
    //    console.log(err, result);
    //})

    //exports.createHar("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "b240fa21-c5b7-4a51-8b54-336f6d2a2e5e", "get", {
    //    "method": "GET",
    //    "url": "http://192.168.100.122:8010/intersect?type=1&uid=2&targets=3",
    //    "httpVersion": "HTTP/1.1",
    //    "queryString": [
    //        {
    //            "name": "type",
    //            "value": "1"
    //        },
    //        {
    //            "name": "uid",
    //            "value": "2"
    //        },
    //        {
    //            "name": "targets",
    //            "value": "3"
    //        }
    //    ],
    //    "headers": [
    //        {
    //            "name": "Accept",
    //            "value": "*/*"
    //        }
    //    ],
    //    "cookies": []
    //}, function (err, result) {
    //    console.log(err, result);
    //});


    //exports.createHar("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "b240fa21-c5b7-4a51-8b54-336f6d2a2e5e", "post", {
    //    "method": "POST",
    //    "headers": [
    //        {
    //            "name": "Content-type",
    //            "value": "application/json"
    //        },
    //        {
    //            "name": "Accept",
    //            "value": "*/*"
    //        }
    //    ],
    //    "cookies": [],
    //    "url": "http://192.168.100.122:8001/user/save",
    //    "httpVersion": "HTTP/1.1",
    //    "queryString": [],
    //   "postData": {
    //        "mimeType": "application/json",
    //        "text": "{\"name\":\"sumory\",\"sex\":\"男\",\"age\":12}"
    //    }
    //}, function (err, result) {
    //    console.log(err, result);
    //});


    //exports.createHar("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "b240fa21-c5b7-4a51-8b54-336f6d2a2e5e", "post-form",{
    //    "method": "POST",
    //    "url": "http://192.168.100.122:8001/user/save",
    //    "httpVersion": "HTTP/1.1",
    //    "queryString": [],
    //    "headers": [
    //        {
    //            "name": "Content-type",
    //            "value": "application/x-www-form-urlencoded"
    //        },
    //        {
    //            "name": "Accept",
    //            "value": "*/*"
    //        }
    //    ],
    //    "cookies": [],
    //    "postData": {
    //        "mimeType": "application/x-www-form-urlencoded",
    //        "params": [
    //            {
    //                "name": "name",
    //                "value": "ss"
    //            },
    //            {
    //                "name": "age",
    //                "value": "45"
    //            }
    //        ]
    //    }
    //}, function (err, result) {
    //    console.log(err, result);
    //});

    //exports.deleteCollection("1", "1", function (err, result) {
    //    console.log(err, result);
    //})

    //exports.createUser({
    //    username: 'sumory',
    //    pwd: '123456'
    //}, Callback);

    //exports.createCollection("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "/user/");
    //exports.createCollection("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "/abc/");
    //exports.createCollection("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "/test/");
    //exports.createCollection("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "/db/test/");
    //exports.createCollection("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "/lmg/");

}

//test();
