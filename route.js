var config = require("./config");
var mockRouter = require('./routes/mock.js');
var postmanRouter = require('./routes/postman.js');
var runRouter = require('./routes/run.js');
var auth = require('./routes/auth.js');
var statusRouter = require('./routes/status.js');

module.exports = function (app) {
    app.use('/auth', auth);
    app.use('/mock', mockRouter);
    app.use('/user', postmanRouter);
    app.use('/status', statusRouter);
    app.use('/run', runRouter);

    app.get('/help', function(req, res){
       res.render('help');
    });

    app.get("/", function (req, res, next) {
        res.render('index');
    });
};