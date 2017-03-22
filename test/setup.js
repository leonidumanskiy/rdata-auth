const mongoose = require('mongoose');
const config = require('../src/config');
const assert = require('assert');

module.exports.before = function before(done){
    assert(config.env === 'test', 'You are trying to run the test with NODE_ENV set to ' + config.env +
        '! Process aborted to prevent potential data loss. Set NODE_ENV to "test" and ' +
        'make sure you have an appropriate mongodb uri set up in the config file for test configuration.');

    mongoose.connect(config.mongo.uri, function(err) {
        mongoose.connection.dropDatabase(done);
    });
};

module.exports.after = function after(done){
    mongoose.connection.dropDatabase(function(){
        mongoose.disconnect(done);
    });
};
