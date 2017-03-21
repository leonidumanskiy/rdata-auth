'use strict';

const mongoose = require('mongoose')
    , Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const roles = ['user', 'instructor'];

const userSchema = new Schema({
    email: {
        type: String,
        match: /^\S+@\S+\.\S+$/,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
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
        lowercase: true
    },
    role: {
        type: String,
        enum: roles,
        default: 'user'
    }
}, {
    timestamps: true
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password')) return next();
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

userSchema.methods.serializeJwt = function serialize(){
    return {
        id: this.id,
        email: this.email,
        username: this.username,
        role: this.role
    };
};

userSchema.statics = {
    roles: roles
};

const User = mongoose.model('User', userSchema, 'users');
module.exports = User;
