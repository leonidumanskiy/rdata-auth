const http = require('http');
const config = require('./config');
const api = require('./api');
const express = require('./services/express');
const mongoose = require('mongoose');

const app = express('/api/v1', api);
const server = http.createServer(app);

// mongoose
mongoose.Promise = Promise;
mongoose.connect(config.mongo.uri);

module.exports = {
    app: app,
    api: api,
    server: server,
    run: function() {
        // start the server
        setImmediate(function () {
            server.listen(config.port, config.ip, function () {
                console.log('Express server listening on http://%s:%d, in %s mode', config.ip, config.port, config.env);
            });
        });
    }
};
