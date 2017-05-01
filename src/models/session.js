'use strict';

const ms = require('ms');
const config = require('../config');
const mongoose = require('mongoose')
    , Schema = mongoose.Schema;

/**
 * Session model represents a refresh token session.
 * If the session gets revoked, refresh token stops working
 */

const providers = ['test', 'local' /*, 'auth_provider_name' */];

const sessionSchema = new Schema({
    provider: {
        type: String,
        enum: providers,
        default: 'local'
    },
    user: {
        type: Object
    }
}, {
    timestamps: true
});

if (!sessionSchema.options.toObject) sessionSchema.options.toObject = {};
sessionSchema.options.toObject.transform = function transform(doc, ret, options) {
    return {
        id: ret._id,
        provider: ret.provider
    }
};

sessionSchema.methods.checkExpired = function expired(callback){
    if(Date.now() < this.createdAt.getTime() + ms(config.refreshTokenExpiresIn)){
        callback(null, false);
    } else {
        Session.remove({_id: this.id}, function onSessionRemoved(err){
            if(err) return callback(err);
            callback(null, true);
        });
    }
};



sessionSchema.methods.toJwtObject = function serialize(){
    return this.toObject();
};

const Session = mongoose.model('Session', sessionSchema, 'sessions');
module.exports = Session;
