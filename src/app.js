const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const errorHandlers = require('./middlewares/error-handlers');
const config = require('./config');
const api = require('./api');

const app = express();
const server = http.createServer(app);

// body-parser
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// mongoose
mongoose.Promise = Promise;
mongoose.connect(config.mongo.uri);

// routes
app.use('/api/v1', api);

// error handlers
app.use(errorHandlers.validationErrorHandler);
app.use(errorHandlers.errorHandler);

setImmediate(function() {
    server.listen(config.port, config.ip, function(){
        console.log('Express server listening on http://%s:%d, in %s mode', config.ip, config.port, config.env);
    });
});

