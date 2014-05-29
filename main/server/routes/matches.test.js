"use strict";

var request = require('supertest');
var assert = require("chai").assert;


var app = require('../../app').app;
var model = require('../model/model');
var modelFactory = require('../model/model-factory');

var storeProvider = require("../store/store-provider");
storeProvider.activeStoreType = storeProvider.StoreType.INMEMORY;
var matchStore = storeProvider.getStore();

var matches = require('./matches');

describe('Mock REST API test /matches', function () {

    describe('GET /matches/:matchId', function () {

        var match = {
            size: 7,
            playerBlack: {playerId: 1, name: 'player1'},
            playerWhite: {playerId: 2, name: 'player2'}};

        beforeEach(function (done) {
            matchStore.createMatch(match, function (err, createdMatch) {
                match = createdMatch;
                done();
            });
        });

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
                    assert.isUndefined(res.body.playerWhite);
                    assert.isUndefined(res.body.playerBlack);
                    assert.isDefined(res.body.matchId);
                    assert.isDefined(res.body.state);
                    assert.isDefined(res.body.size);
                    assert.isUndefined(res.body.history);
                })
                .end(function (err, res) {
                    if (err) throw err;
                    matchStore.getMatch(res.body.matchId, function (err, persistedStore) {
                        assert.ok(persistedStore);
                        done();
                    });
                });
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

            var match = {
                size: 7,
                playerBlack: {playerId: 1, name: 'player1'},
                playerWhite: {playerId: 2, name: 'player2'}};

            matchStore.createMatch(match, function (err, match) {
                request(app)
                    .get('/matches/' + match.matchId + '/board')
                    .expect(200)
                    .expect(function (res) {
                        assert.isArray(res.body);

                        var board = new model.Snapshot(res.body);
                        assert.ok(board);
                    })
                    .end(done);
            });
        });

        it("should return 404 when there is no match with this id", function (done) {
            request(app)
                .get('/matches/someId/board')
                .expect(404, done);
        });

    });

    describe('POST /matches/:matchId/login', function () {


        it("should return ID and save cookie for black player", function (done) {

            matchStore.createMatch({size: 7}, function (err, match) {

                request(app)
                    .post('/matches/' + match.matchId + '/login')
                    .send({name: 'Bob'})
                    .expect(200)
                    .expect('set-cookie', /\w+/)
                    .expect(function (res) {
                        assert.equal(res.body.name, 'Bob');
                        assert.isDefined(res.body.playerId);
                        assert.equal(res.body.color, model.Color.BLACK);
                    })
                    .end(done);

            });

        });


        it("should return ID and save cookie for white player", function (done) {

            var match = {
                size: 7,
                playerBlack: {playerId: 1, name: 'Bob'}};
            matchStore.createMatch(match, function (err, match) {

                request(app)
                    .post('/matches/' + match.matchId + '/login')
                    .send({name: 'Jane'})
                    .expect(200)
                    .expect('set-cookie', /\w+/)
                    .expect(function (res) {
                        assert.equal(res.body.name, 'Jane');
                        assert.isDefined(res.body.playerId);
                        assert.notEqual(res.body.playerId, 1);
                        assert.equal(res.body.color, model.Color.WHITE);

                    })
                    .end(done);

            });
        });

        it("should return 404 when match can't be found", function (done) {

            request(app)
                .post('/matches/someId/login')
                .send({name: "bob"})
                .expect(404, done);
        });


        it("should return 400 when a body without name was send", function (done) {
            matchStore.createMatch({size: 7}, function (err, match) {

                request(app)
                    .post('/matches/' + match.matchId + '/login')
                    .send({something: "other"})
                    .expect(400, done);
            });
        });

        it("should return 409 when already two players in the game", function (done) {

            matchStore.createMatch({
                size: 7,
                playerBlack: {playerId: 1, name: 'Bob'},
                playerWhite: {playerId: 2, name: 'Jane'}
            }, function (err, match) {
                request(app)
                    .post('/matches/' + match.matchId + '/login')
                    .send({name: 'Joe'})
                    .expect(409, done);
            });
        });

    });

    describe('GET /matches/:matchId/self', function () {

        var match = {
            size: 7,
            playerBlack: {playerId: 1, name: 'player1'},
            playerWhite: {playerId: 2, name: 'player2'}};

        beforeEach(function (done) {
            matchStore.createMatch(match, function (err, createdMatch) {
                match = createdMatch;
                done();
            });
        });

        it("should return the own player", function (done) {


            request(app)
                .get('/matches/' + match.matchId + "/self")
                .set('Cookie', [matches.PLAYER_COOKIE_NAME + '=1'])
                .expect(function (res) {
                    assert.equal(res.body.name, 'player1');
                    assert.equal(res.body.color, model.Color.BLACK);
                    assert.isDefined(res.body.playerId);
                })
                .end(done);
        });


        it("should return 401, if you are not authenticated", function (done) {

            request(app)
                .get('/matches/' + match.matchId + '/self')
                .expect(401, done);

        });


        it("should return 404 when there is no match with this id", function (done) {
            request(app)
                .get('/matches/someId/self')
                .expect(404, done);
        });


    });

    describe('GET /matches/:matchId/opponent', function () {

        var match = {
            size: 7,
            playerBlack: {playerId: 1, name: 'player1'},
            playerWhite: {playerId: 2, name: 'player2'}};

        beforeEach(function (done) {
            matchStore.createMatch(match, function (err, createdMatch) {
                match = createdMatch;
                done();
            });
        });

        it("should return the opposing player", function (done) {


            request(app)
                .get('/matches/' + match.matchId + "/opponent")
                .set('Cookie', [matches.PLAYER_COOKIE_NAME + '=1'])
                .expect(function (res) {
                    assert.equal(res.body.name, 'player2');
                    assert.equal(res.body.color, model.Color.WHITE);
                    assert.isUndefined(res.body.playerId);
                })
                .end(done);
        });


        it("should return 401, if you are not authenticated", function (done) {

            request(app)
                .get('/matches/' + match.matchId + '/opponent')
                .expect(401, done);

        });


        it("should return 404 when there is no match with this id", function (done) {
            request(app)
                .get('/matches/someId/opponent')
                .expect(404, done);
        });


    });


    describe('GET /matches/:matchId/moves', function () {

        it("should return done moves", function (done) {


            var match = {
                size: 7,
                playerBlack: {playerId: 1, name: 'player1'},
                playerWhite: {playerId: 2, name: 'player2'}};

            matchStore.createMatch(match, function (err, match) {

                match.addMove(new model.Move(
                    {
                        figure: {
                            color: model.Color.BLACK,
                            type: model.FigureType.ROCKS
                        },
                        from: {column: 0, row: 5},
                        to: {column: 0, row: 4}
                    }));

                request(app)
                    .get('/matches/' + match.matchId + '/moves')
                    .expect(200)
                    .expect(function (res) {
                        assert.isArray(res.body);
                        assert.equal(res.body.length, 1);
                        assert.deepEqual(res.body[0].from, {column: 0, row: 5}); // test sample
                    })
                    .end(done);

            });
        });

        it("should return 404 when there is no match with this id", function (done) {
            request(app)
                .get('/matches/someId/moves')
                .expect(404, done);
        });


    });

    describe('POST /matches/:matchId/moves', function () {


        var match;
        beforeEach(function (done) {
            matchStore.createMatch({
                    size: 7,
                    playerBlack: {playerId: 1, name: 'player1'},
                    playerWhite: {playerId: 2, name: 'player2'}},
                function (err, createdMatch) {
                    match = createdMatch;
                    console.log("")
                    done();
                });
        });


        var move = {figure: {color: model.Color.BLACK, type: model.FigureType.ROCKS},
            from: {column: 2, row: 5},
            to: {column: 2, row: 4}};

        it("should not perform moves, if you are not authenticated", function (done) {

            request(app)
                .post('/matches/' + match.matchId + '/moves')
                .send(move)
                .expect(401, done);

        });

        it("should not perform any moves when you are not logged in this game", function (done) {

            request(app)
                .post('/matches/' + match.matchId + '/moves')
                .set('Cookie', [matches.PLAYER_COOKIE_NAME + '=5'])
                .send(move)
                .expect(401, done);

        });


        it("should add a new move", function (done) {

            //before
            assert.equal(match.history.length, 0);


            request(app)
                .post('/matches/' + match.matchId + '/moves')
                .set('Cookie', [matches.PLAYER_COOKIE_NAME + '=1'])
                .send(move)
                .expect(201)
                .expect(function (res) {
                    assert.isDefined(res.body);
                })
                .end(function (err, res) {
                    if (err) return done(err);

                    matchStore.getMatch(match.matchId, function (err, storedMatch) {
                        // after
                        assert.equal(storedMatch.history.length, 1);
                        assert.deepEqual(storedMatch.history[0], move);

                        done();
                    });
                });
        });


        it("should not add move when it's not the players turn", function (done) {

            var secondMove = {figure: {color: model.Color.WHITE, type: model.FigureType.ROCKS},
                from: {column: 0, row: 1},
                to: {column: 0, row: 2}};

            match.addMove(move);
            matchStore.updateMatch(match, function (err, match) {

                request(app)
                    .post('/matches/' + match.matchId + '/moves')
                    .set('Cookie', [matches.PLAYER_COOKIE_NAME + "=1"]) // black
                    .send(secondMove)
                    .expect(400)
                    .end(function (err) {
                        if (err) throw err;

                        // now its ok
                        request(app)
                            .post('/matches/' + match.matchId + '/moves')
                            .set('Cookie', [matches.PLAYER_COOKIE_NAME + "=2"]) // now white is doing the move
                            .send(secondMove)
                            .expect(201)
                            .end(function (err) {
                                if (err) throw err;

                                var thirdMove = {figure: {color: model.Color.BLACK, type: model.FigureType.ROCKS},
                                    from: {column: 2, row: 4},
                                    to: {column: 2, row: 3}};

                                // now white tries to cheat
                                request(app)
                                    .post('/matches/' + match.matchId + '/moves')
                                    .set('Cookie', [matches.PLAYER_COOKIE_NAME + "=2"]) // white
                                    .send(thirdMove)
                                    .expect(400)
                                    .end(function (err) {
                                        if (err) throw err;

                                        // it's blacks turn
                                        request(app)
                                            .post('/matches/' + match.matchId + '/moves')
                                            .set('Cookie', [matches.PLAYER_COOKIE_NAME + "=1"]) // black
                                            .send(thirdMove)
                                            .expect(201, done);
                                    });
                            });
                    });

            });

        });


        it("should not add move when the player tries to move an enemy figure", function (done) {
            var enemyMove = {figure: {color: model.Color.WHITE, type: model.FigureType.ROCKS},
                from: {column: 0, row: 1},
                to: {column: 0, row: 2}};

            request(app)
                .post('/matches/' + match.matchId + '/moves')
                .set('Cookie', [matches.PLAYER_COOKIE_NAME + "=1"])
                .send(enemyMove)
                .expect(400, done);

        });


        it("should not add bad move", function (done) {

            request(app)
                .post('/matches/' + match.matchId + '/moves')
                .send({something: "other"})
                .set('Cookie', [matches.PLAYER_COOKIE_NAME + '=1'])
                .expect(400, done);
        });

        it("should not add invalid move", function (done) {

            var move = {figure: {color: model.Color.BLACK, type: model.FigureType.ROCKS},
                from: {column: 2, row: 5},
                to: {column: 2, row: 3}};

            request(app)
                .post('/matches/' + match.matchId + '/moves')
                .send(move)
                .set('Cookie', [matches.PLAYER_COOKIE_NAME + '=1'])
                .expect(400, done);
        });

        it("should support HTTP Auth", function (done) {

            var move = {figure: {color: model.Color.BLACK, type: model.FigureType.ROCKS},
                from: {column: 2, row: 5},
                to: {column: 2, row: 4}};

            request(app)
                .post('/matches/' + match.matchId + '/moves')
                .send(move)
                .set('Authorization', matches.HTTP_AUTHORIZATION_METHOD + ' 1')
                .expect(201, done);
        });

        it("should return 404 when there is no match with this id", function (done) {
            request(app)
                .post('/matches/someId/moves')
                .expect(404, done);
        });

    });


    describe('GET /matches/:matchId/valid-moves', function () {

        it("should return all valid moves", function (done) {

            var match = {
                size: 7,
                playerBlack: {playerId: 1, name: 'player1'},
                playerWhite: {playerId: 2, name: 'player2'}};

            matchStore.createMatch(match, function (err, match) {

                request(app)
                    .get('/matches/' + match.matchId + '/valid-moves')
                    .expect(200)
                    .expect(function (res) {

                        assert.isArray(res.body);
                        assert.isTrue(res.body.length > 0);
                    })
                    .end(done);

            });
        });

        it("should return 404 when there is no match with this id", function (done) {
            request(app)
                .post('/matches/someId/valid-moves')
                .expect(404, done);
        });

    });

    describe('GET /matches/:matchId/threats', function () {

        it("should return all threats", function (done) {

            var match = modelFactory.createMatch(model.BoardSize.SMALL);

            matchStore.createMatch(modelFactory.createMatch(model.BoardSize.SMALL), function (err, match) {

                request(app)
                    .get('/matches/' + match.matchId + '/threats')
                    .expect(200)
                    .expect(function (res) {
                        assert.isArray(res.body);
                    })
                    .end(done);

            });
        });

        it("should return 404 when there is no match with this id", function (done) {
            request(app)
                .post('/matches/someId/threats')
                .expect(404, done);
        });

    });

    describe('GET /matches/:matchId/captured-pieces', function () {

        it("should return all captured pieces", function (done) {

            var match = {
                size: 7,
                playerBlack: {playerId: 1, name: 'player1'},
                playerWhite: {playerId: 2, name: 'player2'}};

            matchStore.createMatch(match, function (err, match) {

                request(app)
                    .get('/matches/' + match.matchId + '/captured-pieces')
                    .expect(200)
                    .expect(function (res) {

                        assert.isArray(res.body);
                    })
                    .end(done);

            });
        });

        it("should return 404 when there is no match with this id", function (done) {
            request(app)
                .post('/matches/someId/captured-pieces')
                .expect(404, done);
        });

    });


});