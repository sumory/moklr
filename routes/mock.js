var express = require('express');
var router = express.Router();
var redis = require("../lib/redisUtils.js");
var uuid = require('node-uuid');
var HTTPSnippet = require('httpsnippet');
var util = require("util");
var logger = require('../lib/log.js').logger('mock');

var availableTargets = HTTPSnippet.availableTargets().reduce(function (targets, target) {
    if (target.clients) {
        targets[target.key] = target.clients.reduce(function (clients, client) {
            clients[client.key] = false;
            return clients
        }, {})
    } else {
        targets[target.key] = false;
    }

    return targets
}, {});

router.get('/create', function (req, res, next) {
    res.render('create');
});

router.post('/create', function (req, res, next) {
    var mock = req.body.response;

    var id = uuid.v4();
    redis.set('bin:' + id, mock, function (err, reply) {
        console.log("save moklr", err, reply)
    });

    return res.json({
        success: true,
        data: {
            id: id
        }
    });
});

router.get('/:uuid/view', function (req, res, next) {
    redis.get('bin:' + req.params.uuid, function (err, value) {
        if (err) {
            return res.render('error', {
                msg: "找不到moklr"
            });
        }

        if (value) {
            console.log("view:");
            console.log(JSON.parse(value));
            return res.render('view', {
                uuid: req.params.uuid,
                body: JSON.parse(value)
            });
        }
    })
});

router.get('/:uuid/viewJson', function (req, res, next) {
    redis.get('bin:' + req.params.uuid, function (err, value) {
        if (err) {
            throw err
        }

        console.log("viewJson");
        console.dir(JSON.parse(value));

        if (value) {
            res.json(JSON.parse(value));
        }
    });
});

router.get('/:uuid/sample', function (req, res, next) {
    res.json({
        method: 'POST',
        url: util.format('%s://%s/bin/%s', req.protocol, req.hostname, req.params.uuid),
        httpVersion: 'HTTP/1.1',
        queryString: [{
            name: 'foo',
            value: 'bar'
        }, {
            name: 'foo',
            value: 'baz'
        }],
        headers: [{
            name: 'Accept',
            value: 'application/json'
        }, {
            name: 'Content-Type',
            value: 'application/x-www-form-urlencoded'
        }],
        cookies: [{
            name: 'foo',
            value: 'bar'
        }, {
            name: 'bar',
            value: 'baz'
        }],
        postData: {
            mimeType: 'application/x-www-form-urlencoded',
            params: [{
                name: 'foo2',
                value: 'bar2'
            }, {
                name: 'bar2',
                value: 'baz2'
            }]
        }
    });
});


router.get('/', function (req, res, next) {
    res.send('hello, this is moklr...');
});

router.get('/gen', function (req, res, next) {
    var uuid = decodeURIComponent(req.query.uuid);
    var targets = req.query.targets || 'all';

    if (!uuid) {
        return next(new Error('Invalid input'));
    }

    var requestedTargets = targets.split(',').reduce(function (requested, part) {
        var i = part.split(':');

        var target = i[0] || 'all';
        var client = i[1] || 'all';

        // all targets
        if (target === 'all') {
            // set all members to true
            return Object.keys(availableTargets).reduce(function (requested, target) {
                if (typeof availableTargets[target] === 'object') {
                    requested[target] = Object.keys(availableTargets[target]).reduce(function (clients, client) {
                        clients[client] = true
                        return clients
                    }, {})
                } else {
                    requested[target] = true
                }

                return requested
            }, {})
        }

        // all clients?
        if (availableTargets.hasOwnProperty(target)) {
            if (typeof availableTargets[target] === 'object') {
                if (client === 'all') {
                    requested[target] = Object.keys(availableTargets[target]).reduce(function (clients, client) {
                        clients[client] = true;
                        return clients;
                    }, {});
                } else {
                    if (availableTargets[target].hasOwnProperty(client)) {
                        requested[target] = requested[target] ? requested[target] : {};
                        requested[target][client] = true;
                    }
                }
            } else {
                requested[target] = true;
            }

            return requested;

        }

        return requested;
    }, {});

    redis.get('bin:' + uuid, function (err, response) {
        var snippet;
        var output = {};
        var tmp;

        if (typeof response !== 'object') {
            try {
                tmp = JSON.parse(response)
            } catch (err) {
                return next(new Error('JSON.parse error'));
            }
        }
        //response = { method: 'GET',
        //    url: 'http://sumory.com',
        //    httpVersion: 'HTTP/1.1',
        //    queryString: [],
        //    headers: [ { name: 'Content-Type', value: 'application/json' } ],
        //    cookies: [] };
        response= util._extend({}, tmp);//不转换会出傻逼错
        try {
            snippet = new HTTPSnippet(response)
        } catch (err) {
            return next(new Error('HTTPSnippet constructor error'));
        }

        Object.keys(requestedTargets).map(function (target) {
            if (typeof requestedTargets[target] === 'object') {
                output[target] = {};
                return Object.keys(requestedTargets[target]).map(function (client) {
                    try {
                        output[target][client] = snippet.convert(target, client);
                    } catch (e) {
                        console.error(target, client, e);
                    }
                });
            }

            output[target] = snippet.convert(target);
        });

        if (Object.keys(output).length === 0) {
            return next(new Error('Invalid Targets'));
        }

       // console.log(output);
        return res.json({
            output: output
        });
    });
});

module.exports = router;