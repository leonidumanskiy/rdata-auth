const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('../../config');
const errorHandlers = require('../../middlewares/error-handlers');

module.exports = function app(path, router){

    const app = express();

    // body-parser
    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

    // compression
    app.use(compression());

    // morgan
    app.use(morgan('tiny'));

    // mongoose
    mongoose.Promise = Promise;
    mongoose.connect(config.mongo.uri);

    // routes
    app.use(path, router);

    // error handlers
    app.use(errorHandlers.clientErrorHandler);
    app.use(errorHandlers.validationErrorHandler);
    app.use(errorHandlers.errorHandler);

    return app;
};
