const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const passportService = require('../../../services/passport/index');
const Session = require('../../../models/session');
const User = require('./models').User;
const EmailTakenError = require('./errors').EmailTakenError;
const UsernameTakenError = require('./errors').UsernameTakenError;
const ms = require('ms');

const router = new express.Router();

router.post('/authenticate', passportService.authenticateLocalPassword(), function(req, res, next){
    // Create new session and issue refresh and access tokens
    var user = req.user;
    Session.create({ provider: 'local', user: user.serializeJwt() }, function (err, session) {
        if(err) return next(err);

        // Issue new refresh and access token
        var userSerialized = user.serializeJwt();
        var accessTokenExpiresAt = Date.now() + ms(config.accessTokenExpiresIn);
        var refreshTokenExpiresAt = Date.now() + ms(config.refreshTokenExpiresIn);
        var accessToken = jwt.sign({ user: userSerialized }, config.jwtSecret, { expiresIn: config.accessTokenExpiresIn });
        var refreshToken = jwt.sign({ user: userSerialized, session: session.serializeJwt() }, config.jwtSecret, { expiresIn: config.refreshTokenExpiresIn });

        res.json({refreshToken: refreshToken, accessToken: accessToken, accessTokenExpiresAt: accessTokenExpiresAt, refreshTokenExpiresAt: refreshTokenExpiresAt, user: userSerialized });
    });
});

router.post('/register', function(req, res, next){
    var email = String(req.body.email).trim();
    var password = String(req.body.password).trim();
    var username = String(req.body.username).trim();

    User.findOne({ $or: [{ email: email }, {username: username}] }, function(err, user){
        if(err) return next(err);
        if(user && user.email === email) return next(new EmailTakenError('This email is already taken'));
        if(user && user.username === username) return next(new UsernameTakenError('This username is already taken'));

        User.create({ email: email, username: username, password: password }, function (err, user) {
            if(err) return next(err);
            res.json({user: user.serializeJson()});
        });
    });
});

module.exports = router;
