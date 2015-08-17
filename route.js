var mockRouter = require('./routes/mock.js');
var userRouter = require('./routes/users.js');

var config = require("./config");

module.exports = function (app) {
    app.use('/mock', mockRouter);
    app.use('/user', userRouter);

    app.get("/", function (req, res, next) {
        res.end("welcome!");
    });
};