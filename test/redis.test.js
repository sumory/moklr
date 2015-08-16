var redisUtils = require("../lib/redisUtils.js");

var k = "k1";
var v = "value1";

//redisUtils.set(k, v, function (err, reply) {
//    console.log(err, reply);
//    redisUtils.get(k, function(err, reply){
//        console.log(err, reply);
//    });
//});

var hkey = 'hashkey1';
var f1 = 'f1';
var v1 = 'v1';

//redisUtils.hset(hkey, f1, v1, function(err, reply){
//    console.log('hset', err, reply);
//   redisUtils.hget(hkey, f1, function(err, reply){
//      console.log('result', err, reply);
//   });
//});


var fvs ={};

for(var i =0;i<10;i++){
    fvs['f'+i]="value"+i;
}

redisUtils.hmset(hkey,fvs, function(err, reply){
    console.log('hmset', err, reply);
    redisUtils.hgetall(hkey,function(err, reply){
        console.log('result', err, reply);

        console.log('keys', Object.keys(reply));
    });
});