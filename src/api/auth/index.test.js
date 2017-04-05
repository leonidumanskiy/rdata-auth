const setup = require('../../../test/setup');
const config = require('../../config');
const async = require('async');
const request = require('supertest');
const routes = require('.');
const Session = require('../../models/session');
const express = require('../../services/express');
const assert = require('assert');
const jwt = require('jsonwebtoken');

var app;

var session = { provider: 'test', user: { id: 123456789, test: 'test1234' } };
var sessionModel;


beforeEach(function(done) {
    app = express('/', routes);

    Session.create(session, function (err, sess) {
        if (err) return done(err);
        sessionModel = sess;
        done();
    });
});

afterEach(function(done){
    Session.remove({}, done);
});


describe('POST /refresh', function() {
    it('respond with 401 Unauthorized (no post data)', function(done) {
        request(app)
            .post('/refresh')
            .expect(401, done);
    });

    it('respond with 401 Unauthorized (invalid refresh token)', function(done) {
        request(app)
            .post('/revoke')
            .send({refreshToken: 'invalidrefreshtoken'})
            .expect(401, done);
    });

    it('respond with 200 OK (valid refresh token)', function(done) {
        var refreshToken = jwt.sign({user: session.user, session: sessionModel.serializeJwt()}, config.jwtSecret);
        request(app)
            .post('/refresh')
            .send({refreshToken: refreshToken})
            .expect(200)
            .end(function(err, res) {
                if (err) done(err);
                assert(!res.body.err, 'request returned error');
                assert(res.body.accessToken, 'no access token returned');
                assert(res.body.accessTokenExpiresAt, 'no accessTokenExpiresAt returned');

                var accessToken = jwt.verify(res.body.accessToken, config.jwtSecret);
                assert(accessToken.user.id === session.user.id, "user id dont match");
                done();
            });
    });
});

describe('POST /revoke', function() {
    it('respond with 401 Unauthorized (no post data)', function(done) {
        request(app)
             .post('/revoke')
            .expect(401, done);
    });

    it('respond with 401 Unauthorized (invalid refresh token)', function(done) {
        request(app)
            .post('/revoke')
            .send({refreshToken: 'invalidrefreshtoken'})
            .expect(401, done);
    });

    it('respond with 200 OK (valid refresh token)', function(done) {
        var refreshToken = jwt.sign({user: session.user, session: sessionModel.serializeJwt()}, config.jwtSecret);
        request(app)
            .post('/revoke')
            .send({refreshToken: refreshToken})
            .expect(200)
            .end(function(err, res) {
                if (err) done(err);
                assert(!res.body.err, 'request returned error');
                assert(res.body.result, 'result is not true');

                Session.findOne({_id: sessionModel.id}, function(err, sess){
                    if(err) done(err);
                    assert(!sess, 'session still exists in the database');
                    done();
                });
            });
    });
});