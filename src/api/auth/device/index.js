const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const passportService = require('../../../services/passport/index');
const passport = require('passport');
const Session = require('../../../models/session');
const User = require('./models').User;
const ms = require('ms');

const AnonymousStrategy = require('passport-anonymous').Strategy;

const router = new express.Router();

router.post('/authenticate', passport.authenticate(['anonymous'], {session: false}), function(req, res, next){
    // Create new session and issue refresh and access tokens
    var user = req.body.did;
    console.log(req.body.did);
    Session.create({ provider: 'device', user: user }, function (err, session) {
        if(err) return next(err);

        // Issue new refresh and access token
        var userSerialized = user;
        var accessTokenExpiresAt = Date.now() + ms(config.accessTokenExpiresIn);
        var refreshTokenExpiresAt = Date.now() + ms(config.refreshTokenExpiresIn);
        var accessToken = jwt.sign({ user: userSerialized }, config.jwtSecret, { expiresIn: config.accessTokenExpiresIn });
        var refreshToken = jwt.sign({ user: userSerialized, session: session.toJwtObject() }, config.jwtSecret, { expiresIn: config.refreshTokenExpiresIn });

        res.json({refreshToken: refreshToken, accessToken: accessToken, accessTokenExpiresAt: accessTokenExpiresAt, refreshTokenExpiresAt: refreshTokenExpiresAt, user: userSerialized });
    });
});

passport.use(new AnonymousStrategy());

module.exports = router;
