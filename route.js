var mockRouter = require('./routes/mock.js');

var config = require("./config");

module.exports = function (app) {
    app.use('/mock', mockRouter);

    app.get("/", function (req, res, next) {
        res.end("welcome!");
    });
};