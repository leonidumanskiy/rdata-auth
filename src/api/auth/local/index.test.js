const setup = require('../../../../test/setup');
before(setup.before);
after(setup.after);

const async = require('async');
const request = require('supertest');
const routes = require('.');
const User = require('./models').User;
const express = require('../../../services/express');
const assert = require('assert');

const app = express('/', routes);

var user1 = { username: 'user1', email: 'a@a.com', password: '123456' };
var user2 = { username: 'user2', email: 'b@b.com', password: '123456' };
var user1Model, user2Model;

beforeEach(function(done) {
    async.series([
        function(cb){
            User.create(user1, function(){
                user1Model = user1;
                cb();
            });
        },
        function(cb){
            User.create(user2, function(){
                user1Model = user2;
                cb();
            });
        }
    ], done);
});

afterEach(function(done){
    User.remove({}, done);
});

describe('GET /authenticate', function() {
    it('respond with 400 Bad request', function(done) {
        request(app)
            .post('/authenticate')
            .expect(400, done);
    });
});

describe('GET /authenticate', function() {
    it('respond with 401 Unauthorized', function(done) {
        request(app)
            .post('/authenticate')
            .send({username: user1.username,
                   email: user1.email,
                   password: 'wrongpassword'})
            .expect(401, done);
    });
});

describe('GET /authenticate', function() {
    it('respond with 200 OK', function(done) {
        request(app)
            .post('/authenticate')
            .send({username: user1.username,
                   email: user1.email,
                   password: user1.password})
            .expect(function(res) {
                assert(res.body.accessToken, 'no access token returned');
                assert(res.body.refreshToken, 'no refresh token returned');
            })
            .expect(200, done);
    });
});
