const setup = require('../../../../test/setup');
const config = require('../../../config');
const async = require('async');
const request = require('supertest');
const routes = require('.');
const User = require('./models').User;
const Session = require('../../../models/session');
const express = require('../../../services/express');
const assert = require('assert');
const jwt = require('jsonwebtoken');

var app;

var user = { username: 'user1', email: 'a@a.com', password: '123456' };
var userModel;

beforeEach(function(done) {
    app = express('/', routes);

    User.create(user, function(err, user){
        if(err) return done(err);
        userModel = user;
        done();
    });
});

afterEach(function(done){
    User.remove({}, done);
});

describe('POST /authenticate', function() {
    it('respond with 400 Bad request (no post data)', function(done) {
        request(app)
            .post('/authenticate')
            .expect(401, done);
    });

    it('respond with 401 Unauthorized (invalid username)', function(done) {
        request(app)
            .post('/authenticate')
            .send({username: 'invalid_username',
                   password: user.password})
            .expect(401, done);
    });

    it('respond with 401 Unauthorized (invalid email)', function(done) {
        request(app)
            .post('/authenticate')
            .send({username: 'invalid@email.com',
                password: user.password})
            .expect(401, done);
    });

    it('respond with 401 Unauthorized (invalid password)', function(done) {
        request(app)
            .post('/authenticate')
            .send({username: user.username,
                password: 'invalid'})
            .expect(401, done);
    });

    it('respond with 200 OK (valid auth with username)', function(done) {
        request(app)
            .post('/authenticate')
            .send({username: user.username,
                   password: user.password})
            .expect(function(res) {
                assert(res.body.accessToken, 'no access token returned');
                assert(res.body.refreshToken, 'no refresh token returned');
                assert(res.body.accessTokenExpiresAt, 'no accessTokenExpiresAt returned');
                assert(res.body.refreshTokenExpiresAt, 'no refreshTokenExpiresAt returned');
                assert(res.body.user, 'no user returned');
            })
            .expect(200, done);
    });

    it('respond with 200 OK (valid auth with email)', function(done) {
        request(app)
            .post('/authenticate')
            .send({username: user.email,
                password: user.password})
            .expect(function(res) {
                assert(res.body.accessToken, 'no access token returned');
                assert(res.body.refreshToken, 'no refresh token returned');
                assert(res.body.accessTokenExpiresAt, 'no accessTokenExpiresAt returned');
                assert(res.body.refreshTokenExpiresAt, 'no refreshTokenExpiresAt returned');
                assert(res.body.user, 'no user returned');
            })
            .expect(200, done);
    });

    it('respond with 200 OK (valid auth token)', function(done) {
        request(app)
            .post('/authenticate')
            .send({username: user.email,
                password: user.password})
            .expect(200)
            .end(function(err, res) {
                if(err) done(err);
                assert(res.body.accessToken, 'no access token returned');
                assert(res.body.accessTokenExpiresAt, 'no accessTokenExpiresAt returned');
                assert(res.body.refreshTokenExpiresAt, 'no refreshTokenExpiresAt returned');
                assert(res.body.user, 'no user returned');
                var accessToken = jwt.verify(res.body.accessToken, config.jwtSecret);
                assert(accessToken.user.id === userModel.id, "user id dont match");
                done();
            })
    });

    it('respond with 200 OK (valid refresh token)', function(done) {
        request(app)
            .post('/authenticate')
            .send({username: user.email,
                password: user.password})
            .expect(200)
            .end(function(err, res) {
                if(err) done(err);
                assert(res.body.refreshToken, 'no refresh token returned');
                assert(res.body.accessTokenExpiresAt, 'no accessTokenExpiresAt returned');
                assert(res.body.refreshTokenExpiresAt, 'no refreshTokenExpiresAt returned');
                assert(res.body.user, 'no user returned');
                var refreshToken = jwt.verify(res.body.refreshToken, config.jwtSecret);
                assert(refreshToken.user.id === userModel.id, "user id dont match");
                var sessionId = refreshToken.session.id;
                Session.findOne({_id: sessionId}, function(err, session){
                    if(err) return done(err);
                    assert(session, 'no session found');
                    session.checkExpired(function(err, expired){
                        if(err) return done(err);
                        assert(!expired, 'session expired');
                        done();
                    });
                });
            })
    });
});

describe('POST /register', function() {

    it('respond with 200 OK (registers the user)', function(done) {
        request(app)
            .post('/register')
            .send({ email: 'c@c.com',
                username: 'user3',
                password: '123456'})
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                User.findOne({_id: res.body.user.id}, function(err, user) {
                    if (err) return done(err);
                    assert(user, 'no user found in the db after registration');
                    done();
                });
            });
    });

    it('respond with 400 Bad request (no post data)', function(done) {
        request(app)
            .post('/register')
            .expect(400, done);
    });

    it('respond with 400 Bad request (bad username format)', function(done) {
        request(app)
            .post('/register')
            .send({ username: 'bad@username',
                password: '123456',
                email: 'a@a.com'})
            .expect(function(res) {
                assert(res.body.error.name, 'ValidationError');
            })
            .expect(400, done);
    });

    it('respond with 400 Bad request (no username)', function(done) {
        request(app)
            .post('/register')
            .send({ password: '123456',
                email: 'a@a.com'})
            .expect(function(res) {
                assert(res.body.error.name, 'ValidationError');
            })
            .expect(400, done);
    });

    it('respond with 400 Bad request (no email)', function(done) {
        request(app)
            .post('/register')
            .send({ password: '123456',
                username: 'user3'})
            .expect(function(res) {
                assert(res.body.error.name, 'ValidationError');
            })
            .expect(400, done);
    });

    it('respond with 400 Bad request (no password)', function(done) {
        request(app)
            .post('/register')
            .send({ email: 'a@a.com',
                username: 'user3'})
            .expect(function(res) {
                assert(res.body.error.name, 'ValidationError');
            })
            .expect(400, done);
    });

    it('respond with 400 Bad request (username taken)', function(done) {
        request(app)
            .post('/register')
            .send({ email: 'c@c.com',
                username: user.username,
                password: '123456'})
            .expect(function(res) {
                assert(res.body.error.name, 'ValidationError');
            })
            .expect(400, done);
    });

    it('respond with 400 Bad request (email taken)', function(done) {
        request(app)
            .post('/register')
            .send({ email: user.email,
                username: 'user3',
                password: '123456'})
            .expect(function(res) {
                assert(res.body.error.name, 'ValidationError');
            })
            .expect(400, done);
    });
});
