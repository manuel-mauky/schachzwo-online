"use strict";

var assert = require("chai").assert;
var EventSource = require('eventsource');


var app = require('../../app').app;
var sse = require('./sse');
var matches = require('../routes/matches');
var matchStore = require("../store/inmemory-store");

describe('SSE tests', function () {

    var server, match;

    beforeEach(function (done) {
        server = app.listen(8000);
        matchStore.createMatch({
            size: 7,
            playerBlack: {playerId: 1, name: 'player1'},
            playerWhite: {playerId: 2, name: 'player2'}}, function (err, createdMatch) {
            match = createdMatch;
            done();
        });
    });

    afterEach(function () {
        server.close();

    });

    it("should send messages to all clients of the game", function (done) {

        var source = new EventSource("http://localhost:8000/matches/" + match.matchId);

        source.addEventListener("message", function (event) {
            assert.equal(event.data, sse.SSEMessage.UPDATE);
            done();
        }, false);

        setTimeout(function () {
            sse.sendMessage(sse.SSEMessage.UPDATE, match.matchId);
        }, 10);
    });


    it("should not send messages to clients of other games", function (done) {


        matchStore.createMatch({
            size: 9,
            playerBlack: {playerId: 5, name: 'player5'},
            playerWhite: {playerId: 8, name: 'player8'}}, function (err, otherMatch) {


            var source = new EventSource("http://localhost:8000/matches/" + otherMatch.matchId);

            source.addEventListener("message", function (event) {
                assert.fail(undefined, undefined, "The message should not have been received.");
                done();
            }, false);

            setTimeout(function () {
                sse.sendMessage(sse.SSEMessage.UPDATE, match.matchId);
            }, 10);

            setTimeout(function () {
                done();
            }, 10);

        });
    });

    it("should send private messages only to specific clients", function (done) {

        var clientPlayer1 = new EventSource("http://localhost:8000/matches/" + match.matchId, {
            headers: {
                'Cookie': [matches.PLAYER_COOKIE_NAME + '=1']
            }
        });

        clientPlayer1.addEventListener("message", function (event) {
            assert.equal(event.data, sse.SSEMessage.HAS_WON_BY_CHECK_MATE);
            done();
        }, false);

        setTimeout(function () {
            sse.sendMessage(sse.SSEMessage.HAS_WON_BY_CHECK_MATE, match.matchId, '1');
        }, 10);


    });

    it("should not send private messages to the opponent or spectator", function (done) {


        var listener = function (event) {
            assert.fail(undefined, undefined, "The message should not have been received.");
            done();
        };

        // opponent
        new EventSource("http://localhost:8000/matches/" + match.matchId, {
            headers: {
                'Cookie': [matches.PLAYER_COOKIE_NAME + '=1']
            }
        }).addEventListener("message", listener, false);


        // spectator
        new EventSource("http://localhost:8000/matches/" + match.matchId)
            .addEventListener("message", listener, false);


        setTimeout(function () {
            sse.sendMessage(sse.SSEMessage.HAS_LOST_BY_CHECK_MATE, match.matchId, '2');

        }, 10);

        setTimeout(function () {
            done();
        }, 10);

    });


});