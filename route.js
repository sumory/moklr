var mockRouter = require('./routes/mock.js');
var userRouter = require('./routes/users.js');
var runRouter = require('./routes/run.js');

var config = require("./config");

module.exports = function (app) {
    app.use('/mock', mockRouter);
    app.use('/user', userRouter);
    app.use('/run', runRouter);

    app.get("/", function (req, res, next) {
        res.end("welcome!");
    });
};