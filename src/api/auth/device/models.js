'use strict';

const mongoose = require('mongoose')
    , Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userRoleSchema = new Schema({
    role: {
        type: String
    },
    game: {
        type: String
    },
    group: {
        type: String
    }
});

if (!userRoleSchema.options.toObject) userRoleSchema.options.toObject = {};
userRoleSchema.options.toObject.transform = function transform(doc, ret, options) {
    return {
        role: ret.role,
        game: ret.game,
        group: ret.group
    }
};

const userSchema = new Schema({
    email: {
        type: String,
        match: /^\S+@\S+\.\S+$/,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    username: {
        type: String,
        match: /^[A-Za-z0-9-_. ]+$/,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    roles: [userRoleSchema]
}, {
    timestamps: true
});

if (!userSchema.options.toObject) userSchema.options.toObject = {};
userSchema.options.toObject.transform = function transform(doc, ret, options) {
    return {
        id: ret._id,
        email: ret.email,
        username: ret.username,
        roles: ret.roles
    }
};

userSchema.methods.toJwtObject = function serialize(){
    return this.toObject();
};

/**
 * This temporary flag is used in the registration, to allow hashing the password on the client
 * before registering new account (or transferring user from other systems that also use bcrypt)
 */
userSchema.virtual('passwordIsHashed').get(function () {
    return this.__passwordIsHashed;
}).set(function (value) {
    this.__passwordIsHashed = value;
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.__passwordIsHashed) return next();
    var model = this;
    var rounds = 10;
    bcrypt.hash(model.password, rounds, function onHashed(error, hash){
        if(error) return next(error);
        model.password = hash;
        next();
    });
});

userSchema.methods.authenticate = function authenticate(password, callback) {
    bcrypt.compare(password, this.password, function onCompare(error, isValid){
        if(error) return callback(error);
        callback(null, isValid);
    });
};


const User = mongoose.model('deviceid', userSchema, 'users');
module.exports.User = User;
