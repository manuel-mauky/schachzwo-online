"use strict";

var request = require('supertest');
var express = require("express");
var assert = require("chai").assert;

var model = require("../model/model");

var app = require('../../app').app;
var matchStore = require('../store/match.store');
var matches = require('./matches');

describe.skip('Mock REST API test /matches', function () {

    describe('GET /matches/:matchId', function () {

        var match = matchStore.create({
            size: 7,
            playerBlack: {playerId: 1, name: 'player1'},
            playerWhite: {playerId: 2, name: 'player2'}});

        it("should be 200", function (done) {

            request(app)
                .get('/matches/' + match.matchId)
                .expect(200, done);
        });

        it("should be 404", function (done) {
            request(app)
                .get('/matches/some-id')
                .expect(404, done);
        });

        it("should have no history", function (done) {
            request(app)
                .get('/matches/' + match.matchId)
                .expect(function (res) {
                    assert.isUndefined(res.body.history);
                })
                .end(done);
        });

        it("should have no player ids", function (done) {
            request(app)
                .get('/matches/' + match.matchId)
                .expect(function (res) {
                    assert.isUndefined(res.body.playerBlack.playerId);
                    assert.isUndefined(res.body.playerWhite.playerId);
                })
                .end(done);
        });

        it("should have all required attributes", function (done) {
            request(app)
                .get('/matches/' + match.matchId)
                .expect(function (res) {
                    assert.isDefined(res.body.matchId);
                    assert.isDefined(res.body.size);
                })
                .end(done);
        });
    });

    describe('POST /matches', function () {

        it("should return new match", function (done) {

            request(app)
                .post('/matches')
                .send({size: 7})
                .expect(201)
                .expect('location', /\/\w+/)
                .expect(function (res) {
                    assert.isDefined(res.body.playerWhite);
                    assert.isDefined(res.body.playerBlack);
                    assert.isDefined(res.body.matchId);
                    assert.isDefined(res.body.state);
                    assert.isDefined(res.body.size);
                    assert.isUndefined(res.body.history);
                })
                .end(done);
        });

        it("should not return new match", function (done) {

            request(app)
                .post('/matches')
                .send({size: 5})
                .expect(400, done);

        });


    });


    describe('GET /matches/:matchId/board', function () {

        it("should return actual board snapshot", function (done) {

            var match = matchStore.create({
                size: 7,
                playerBlack: {playerId: 1, name: 'player1'},
                playerWhite: {playerId: 2, name: 'player2'}});

            request(app)
                .get('/matches/' + match.matchId + '/board')
                .expect(200)
                .expect(function (res) {
                    assert.isArray(res.body);
                })
                .end(done);

        });

    });

    describe('POST /matches/:matchId/login', function () {


        it("should return ID and save cookie for black player", function (done) {

            var match = matchStore.create({                size: 7});

            request(app)
                .post('/matches/'+  match.matchId + '/login')
                .send({name: 'Bob'})
                .expect(200)
                .expect('set-cookie',  /\w+/)
                .expect(function (res) {
                    assert.equal(res.body.name, 'Bob');
                    assert.isDefined(res.body.playerId);
                    assert.equal(res.body.color, model.Color.BLACK);


                })
                .end(done);

        });

        it("should return ID and save cookie for white player", function (done) {


            var match = matchStore.create({
                size: 7,
                playerBlack: {playerId: 1, name: 'Bob'}
            });

            request(app)
                .post('/matches/'+  match.matchId + '/login')
                .send({name: 'Jane'})
                .expect(200)
                .expect('set-cookie',  /\w+/)
                .expect(function (res) {
                    assert.equal(res.body.name, 'Jane');
                    assert.isDefined(res.body.playerId);
                    assert.equal(res.body.color, model.Color.WHITE);

                })
                .end(done);

        });

        it("should return 409", function (done) {

            var match = matchStore.create({
                size: 7,
                playerBlack: {playerId: 1, name: 'Bob'},
                playerWhite: {playerId: 2, name: 'Jane'}
            });

            request(app)
                .post('/matches/'+  match.matchId + '/login')
                .send({name: 'Joe'})
                .expect(409, done);
        });

    });


    describe('GET /matches/:matchId/moves', function () {

        it("should return done moves", function (done) {

            var match = matchStore.create({
                size: 7,
                playerBlack: {playerId: 1, name: 'player1'},
                playerWhite: {playerId: 2, name: 'player2'}});

            request(app)
                .get('/matches/' + match.matchId + '/moves')
                .expect(200)
                .expect(function (res) {
                    assert.isArray(res.body);
                })
                .end(done);

        });


    });

    describe('POST /matches/:matchId/moves', function () {

        var match = matchStore.create({
            size: 7,
            playerBlack: {playerId: 1, name: 'player1'},
            playerWhite: {playerId: 2, name: 'player2'}});

        var move = {figure: {color: model.Color.BLACK, type: model.FigureType.ROCKS},
            from: {column: 2, row: 1},
            to: {column: 2, row: 2}};


        it("should not perform moves, if you are not authenticates", function (done) {

            request(app)
                .post('/matches/'+  match.matchId + '/moves')
                .send(match)
                .expect(401, done);

        });

        it("should not perform any moves when you are not logged in this game", function (done) {

            request(app)
                .post('/matches/'+  match.matchId + '/moves')
                .set('Cookie', [matches.PLAYER_COOKIE_NAME + '=5'])
                .send(match)
                .expect(401, done);

        });

        it("should add a new move", function (done) {


            request(app)
                .post('/matches/'+  match.matchId + '/moves')
                .set('Cookie', [matches.PLAYER_COOKIE_NAME + '=1'])
                .send(match)
                .expect(201)
                .expect(function (res) {
                    assert.isDefined(res.body);
                })
                .end(done);
        });

        it("should not add invalid move", function (done) {

            var move = {figure: {color: model.Color.BLACK, type: model.FigureType.ROCKS},
                from: {column: 2, row: 2},
                to: {column: 3, row: 2}};

            request(app)
                .post('/matches/'+  match.matchId + '/moves', move)
                .set('Cookie', [matches.PLAYER_COOKIE_NAME + '=1'])
                .expect(400, done);
        });

    });


    describe('GET /matches/:matchId/valid-moves', function () {

        it("should return all valid moves", function (done) {

            var match = matchStore.create({
                size: 7,
                playerBlack: {playerId: 1, name: 'player1'},
                playerWhite: {playerId: 2, name: 'player2'}});

            request(app)
                .get('/matches/' + match.matchId + '/valid-moves')
                .expect(200)
                .expect(function (res) {
                    assert.isArray(res.body);
                })
                .end(done);
        });

    });

});