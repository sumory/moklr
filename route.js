var config = require("./config");
var mockRouter = require('./routes/mock.js');
var userRouter = require('./routes/user.js');
var runRouter = require('./routes/run.js');
var auth = require('./routes/auth.js');

module.exports = function (app) {
    app.use('/auth', auth);
    app.use('/mock', mockRouter);
    app.use('/user', userRouter);
    app.use('/run', runRouter);

    app.get('/help', function(req, res){
       res.render('help');
    });

    app.get("/", function (req, res, next) {
        res.render('index');
    });
};