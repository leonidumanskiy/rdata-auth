'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const config = require('../../config');
const User = require('../../api/auth/local/models').User;
const Session = require('../../models/session');

var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

function PassportService() {
    var self = this;

    this.localPasswordStrategy = new LocalStrategy(
        function(username, password, cb) {
            User.findOne({ $or: [{email: username.trim().toLowerCase()}, { username: username.trim().toLowerCase() }]}, function(err, user) {
                if (err) return cb(err);
                if (!user) return cb(null, false);
                user.authenticate(password, function onAuthenticate(error, isValid){
                   if(error) return cb(error);
                   if(!isValid) return cb(null, false);
                   return cb(null, user);
                });
            });
        }
    );

    var refreshTokenJwtStrategyOptions = {
        secretOrKey: config.jwtSecret,
        jwtFromRequest: ExtractJwt.fromExtractors([
            ExtractJwt.fromUrlQueryParameter('refreshToken'),
            ExtractJwt.fromBodyField('refreshToken')
        ])
    };

    // Refresh token strategy validates the refresh token,
    // validates the session using the database, and returns serialized user
    this.refreshTokenStrategy = new JwtStrategy(refreshTokenJwtStrategyOptions, function(jwtPayload, next) {
        var sessionId = jwtPayload.session.id;
        var user = jwtPayload.user;
        Session.findById(sessionId, function(error, session){
            if(error) return next(error);
            if(!session) return next(null, false);
            session.checkExpired(function(err, expired){
                if(err) return next(err, null);
                if(expired) return next(null, false);

                // session is valid
                user.currentSessionId = sessionId; // TODO: Find better way of doing it
                next(null, user);
            });
        });
    });

    var accessTokenJwtStrategyOptions = {
        secretOrKey: config.jwtSecret,
        jwtFromRequest: ExtractJwt.fromExtractors([
            ExtractJwt.fromUrlQueryParameter('accessToken'),
            ExtractJwt.fromBodyField('accessToken'),
            ExtractJwt.fromAuthHeaderWithScheme('Bearer')
        ])
    };

    // Access token strategy validates the access token and returns the user serialized in the payload
    this.accessTokenStrategy = new JwtStrategy(accessTokenJwtStrategyOptions, function(jwtPayload, next){
        var user = jwtPayload.user;
        next(null, user);
    });

    passport.use('localPassword', this.localPasswordStrategy);
    passport.use('refreshToken', this.refreshTokenStrategy);
    passport.use('accessToken', this.accessTokenStrategy);

    this.authenticateLocalPassword = function authenticatePassword() { return passport.authenticate('localPassword', { session: false, failWithError: true }) };
    this.authenticateRefreshToken = function authenticateRefreshToken() { return passport.authenticate('refreshToken', { session: false, failWithError: true }) };
    this.authenticateAccessToken = function authenticateAccessToken() { return passport.authenticate('accessToken', { session: false, failWithError: true }) };
}

module.exports = new PassportService();
