var Redis = require("ioredis");
var config = require("../config");



var redis;

exports.init= function(){
    if(!redis){
        redis = new Redis({
            port:config.redis.port,
            host:config.redis.address,
            family:4,
            password:"",
            db:0
        });
    }
};


exports.set = function(k, v, callback){
    console.log(k,v);
    redis.set(k,v,callback);
};

exports.get = function(k, callback){
    redis.get(k, callback);
};

/**
 * hset
 * 如果 field 是哈希表中的一个新建域，并且值设置成功，返回 1
 * 如果哈希表中域 field 已经存在且旧值已被新值覆盖，返回 0
 *
 * @param k key
 * @param f field
 * @param v value
 * @param callback
 */
exports.hset = function(k,f, v, callback){
    redis.hset(k,f,v,callback);
};

exports.hget = function(k, f, callback){
    redis.hget(k,f,callback);
};

/**
 * hmset
 * 同时将多个 field-value (域-值)对设置到哈希表 key 中
 *
 * @param k
 * @param fvs object {field1: value1, field2: value2}
 * @param callback
 */
exports.hmset = function(k,fvs,callback){
    redis.hmset(k, fvs, callback);
};


/**
 * hgetall
 *
 * { k1: 'v1', 'k2': 'v2' }
 *
 * @param k
 * @param callback
 */
exports.hgetall = function(k, callback){
    redis.hgetall(k, callback);
};