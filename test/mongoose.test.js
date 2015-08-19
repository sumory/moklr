var mongoose = require('mongoose');
mongoose.connect('mongodb://192.168.100.186:20301/moklr');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    userId: String,
    username: String,
    pwd: String,
    date: {type: Date, default: Date.now}
});

UserSchema.statics.findbyUsername = function (username, callback) {
    return this.model('User').find({username: username}, callback);
};

var CollectionSchema = new Schema({
    collectionId: String,
    userId: String,
    hars: [String],
    date: {type: Date, default: Date.now}
});

CollectionSchema.statics.findAllByUserId = function (userId, callback) {
    return this.model('Collection').find({userId: userId}, callback);
};

var HarSchema = new Schema({
    harId: String,
    userId: String,
    collectionId: String,
    name: String,
    content: {},
    date: {type: Date, default: Date.now}
});


var User = mongoose.model('User', UserSchema, "user");
var Collection = mongoose.model('Collection', CollectionSchema, "collection");
var Har = mongoose.model('Har', HarSchema, "har");

//var u = new User({
//    username: "test",
//    pwd:"t11"
//});

User.findbyUsername('sumory', function (error, u) {
    console.log("find", error, u)
});


//var collection = new Collection({
//    userId: "1",
//    collectionId: "1",
//    hars: []
//});
//collection.save();

var har = new Har({
    harId: "1",
    userId: "1",
    name: "/user/save",
    content: {
        "method": "GET",
        "url": "http://192.168.100.122:8010/allrelation?uid=856318",
        "httpVersion": "HTTP/1.1",
        "queryString": [
            {
                "name": "uid",
                "value": "856318"
            }
        ],
        "headers": [
            {
                "name": "Accept",
                "value": "*/*"
            }
        ],
        "cookies": []
    }
});

har.save();