const express = require('express');
const config = require('../../config');
const passportService = require('../../services/passport/index');
const Session = require('../../models/session');
const jwt = require('jsonwebtoken');
const ms = require('ms');

const local = require('./local/index');

const router = new express.Router();

router.use('/local', local);


router.post('/refresh', passportService.authenticateRefreshToken(), function(req, res, next){
    // Issue another access token based on the refresh token
    var userSerialized = req.user; // in refresh token strategy, user is taken from the JWT payload and is already jwt-serialized
    var accessTokenExpiresAt = Date.now() + ms(config.accessTokenExpiresIn);
    var accessToken = jwt.sign({ user: userSerialized }, config.jwtSecret, { expiresIn: config.accessTokenExpiresIn });

    res.json({accessToken: accessToken, accessTokenExpiresAt: accessTokenExpiresAt, user: userSerialized});
});


router.post('/revoke', passportService.authenticateRefreshToken(), function(req, res, next){
    // Revoke session and refresh token.
    // It's not possible to revoke the access token, we just have to wait for it to expire

    var currentSessionId = req.user.currentSessionId; // TODO: Find better way of doing it

    Session.findById(currentSessionId, function(err, session){
        if(err) return next(err);
        if(!session) return next(new Error("Session was not found"));

        Session.remove({_id: session.id}, function(err){
            if(err) return next(err);
            res.json({result: true});
        });
    });
});

module.exports = router;
