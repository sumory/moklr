var mongoose = require('mongoose');
var config = require('../config');
var uuid = require('node-uuid');
var logger = require('../lib/log.js').logger('moklrModel');

mongoose.connect(config.mongodb.address);
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    userId: {type: String, index: true},
    username:{type: String, index: true, unique:true},
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
    hars: [String],
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
    u.save(function(err, u){
        if(err) {
            logger.error("创建用户失败", err,u );
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
        name: name,
        hars: []
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

        har.save().then(function (har, numberAffected) {
            c.hars = c.hars || [];
            c.hars.push(harId);
            c.save().then(function (c, numberAffected) {
                callback(null);
            }).reject(function (err) {
                callback(err);
            });
        }).reject(function (err) {
            callback(new Error("无法保存har"));
        });
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

    exports.createHar("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "b240fa21-c5b7-4a51-8b54-336f6d2a2e5e", "har1111", {
        method: 'GET',
        url: 'http://sumory.com',
        httpVersion: 'HTTP/1.1',
        queryString: [],
        headers: [{name: 'Content-Type', value: 'application/json'}],
        cookies: []
    }, function (err, result) {
        console.log(err, result);
    })

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

test();
