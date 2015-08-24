var express = require('express');
var router = express.Router();
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


router.get('/gen', function (req, res, next) {
    var har = req.query.har;
    var targets = req.query.targets || 'all';
    console.log(har)

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

    var response = har;
    var snippet;
    var output = {};

    if (typeof response !== 'object') {
        try {
            response = JSON.parse(response);
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
    //response = util._extend({}, tmp);//不转换会出傻逼错

    console.dir(response);
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

module.exports = router;