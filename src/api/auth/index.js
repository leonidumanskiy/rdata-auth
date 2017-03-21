const express = require('express');
const config = require('../../config');
const passportService = require('../../services/passport');
const Session = require('../../models/session');

const local = require('./local');

const router = new express.Router();

router.use('/local', local);

router.post('/revoke', passportService.authenticateRefreshToken(), function(req, res, next){
    // Revoke session and refresh token.
    // It's not possible to revoke the access token, we just have to wait for it to expire

    var currentSessionId = req.user.currentSessionId; // TODO: Find better way of doing it

    Session.findById(currentSessionId, function(err, session){
        if(err) return next(err);
        if(!session) return res.json({error: "session"});

        Session.remove({_id: session.id}, function(err){
            if(err) return next(err);
            res.json({result: "ok"});
        });
    });
});

router.post('/test', passportService.authenticateAccessToken(), function(req, res){
    res.json({result: "ok"});
});


module.exports = router;
