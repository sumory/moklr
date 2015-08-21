var express = require('express');
var router = express.Router();
var moklrModel = require('../models/moklrModel.js');
var logger = require('../lib/log.js').logger('authRouter');

router.get('/', function(req, res, next) {
    res.render('login');
});


module.exports = router;