var moklrModel = require("../models/moklrModel.js");



function test() {
    moklrModel.findCollections("1", function(err, result){
        console.log(err, result);
    });

    moklrModel.findHarsOfCollection("1", function (err, result) {
        console.log(err, result);
    });

    moklrModel.createHar("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "b240fa21-c5b7-4a51-8b54-336f6d2a2e5e", "get", {
        "method": "GET",
        "url": "http://192.168.100.122:8010/intersect?type=1&uid=2&targets=3",
        "httpVersion": "HTTP/1.1",
        "queryString": [
            {
                "name": "type",
                "value": "1"
            },
            {
                "name": "uid",
                "value": "2"
            },
            {
                "name": "targets",
                "value": "3"
            }
        ],
        "headers": [
            {
                "name": "Accept",
                "value": "*/*"
            }
        ],
        "cookies": []
    }, function (err, result) {
        console.log(err, result);
    });


    moklrModel.createHar("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "b240fa21-c5b7-4a51-8b54-336f6d2a2e5e", "post", {
        "method": "POST",
        "headers": [
            {
                "name": "Content-type",
                "value": "application/json"
            },
            {
                "name": "Accept",
                "value": "*/*"
            }
        ],
        "cookies": [],
        "url": "http://192.168.100.122:8001/user/save",
        "httpVersion": "HTTP/1.1",
        "queryString": [],
       "postData": {
            "mimeType": "application/json",
            "text": "{\"name\":\"sumory\",\"sex\":\"男\",\"age\":12}"
        }
    }, function (err, result) {
        console.log(err, result);
    });


    moklrModel.createHar("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "b240fa21-c5b7-4a51-8b54-336f6d2a2e5e", "post-form",{
        "method": "POST",
        "url": "http://192.168.100.122:8001/user/save",
        "httpVersion": "HTTP/1.1",
        "queryString": [],
        "headers": [
            {
                "name": "Content-type",
                "value": "application/x-www-form-urlencoded"
            },
            {
                "name": "Accept",
                "value": "*/*"
            }
        ],
        "cookies": [],
        "postData": {
            "mimeType": "application/x-www-form-urlencoded",
            "params": [
                {
                    "name": "name",
                    "value": "ss"
                },
                {
                    "name": "age",
                    "value": "45"
                }
            ]
        }
    }, function (err, result) {
        console.log(err, result);
    });

    moklrModel.deleteCollection("1", "1", function (err, result) {
        console.log(err, result);
    });

    moklrModel.createUser({
        username: 'sumory',
        pwd: '123456'
    }, function (err, result) {
        console.log(err, result);
    });

    moklrModel.createCollection("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "/user/");
    moklrModel.createCollection("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "/abc/");
    moklrModel.createCollection("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "/test/");
    moklrModel.createCollection("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "/db/test/");
    moklrModel.createCollection("db46161c-917a-40d8-b1fd-242e7cc8f4b3", "/lmg/");

    moklrModel.findStatusAPILogsByTime("868c8567-4126-4341-ae8f-50e232fe8602",new Date("2015-08-27 14:20:39"),new Date("2015-08-27 14:40:39"),function(err, result){
        console.log(err, result);
    });
}

function createUser(){
    moklrModel.createUser({
        username: 'test',
        pwd: '123456'
    }, function (err, result) {
        console.log(err, result);
        process.exit(0);
    });
}

createUser();
