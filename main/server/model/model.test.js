"use strict"


var assert = require("chai").assert;
var model = require("./model");


var BoardSize = model.BoardSize;
var Color = model.Color;
var FigureType = model.FigureType;
var Figure = model.Figure;
var Field = model.Field;
var Player = model.Player;
var State = model.State;
var Match = model.Match;
var Snapshot = model.Snapshot;
var Position = model.Position;
var Move = model.Move;

var modelFactory = require("./model-factory.js");

describe("Creation of Figure", function () {

    it("should not be possible to with empty constructor", function () {
        assert.throws(function(){
            new Figure();
        });
    });


    it("should be possible with constructor params", function () {

        var man = new model.Figure({color: Color.BLACK, type: FigureType.MAN});

        assert.ok(man);
        assert.equal(man.color, Color.BLACK);
        assert.equal(man.type, FigureType.MAN);
    });

});

describe("Match", function(){
    describe("Creation of Match", function () {

        it("should be possible with empty constructor", function () {
            var match = new Match();

            assert.ok(match);

            assert.isArray(match.history);
            assert.equal(match.history.length, 0);
        });

        it("should be possible from json", function () {

            var json = {

                matchId: "12345",

                playerWhite: {
                    playerId: "102",
                    name: "max mustermann"
                },
                playerBlack: {
                    playerId: "104",
                    name: "john doe"
                },

                state: "playing",

                size: 7,
                history: [

                    {
                        figure: {
                            color: "black",
                            type: "rocks"
                        },
                        from: {
                            column: 0,
                            row: 0
                        },
                        to: {
                            column: 1,
                            row: 1
                        }
                    }
                ]
            };

            var match = new Match(json);

            assert.ok(match);

            assert.equal(match.matchId, "12345");

            var max = new Player({playerId: "102", name: "max mustermann"});
            var john = new Player({playerId: "104", name: "john doe"});

            assert.deepEqual(match.playerWhite, max);
            assert.deepEqual(match.playerBlack, john);
            assert.instanceOf(match.playerBlack, Player);
            assert.instanceOf(match.playerWhite, Player);

            assert.equal(match.state, State.PLAYING);

            assert.equal(match.size, 7);


            assert.isArray(match.history);
            assert.equal(match.history.length, 1);


            var rocks = new Figure({color: Color.BLACK, type: FigureType.ROCKS});

            var move = match.history;
            assert.ok(move);
            assert.isArray(move);
            assert.equal(move.length, 1);

            assert.deepEqual(move[0], new Move({figure: rocks, from:{column: 0, row: 0},to:{column: 1, row: 1}}));
            assert.instanceOf(move[0].figure, Figure);
            assert.instanceOf(move[0].from, Position);
            assert.instanceOf(move[0].to, Position);

        });

    });


    describe("GetCurrentSnapshot accessor function of Match", function(){

        it("should return the first snapshot for a fresh match", function(){
            // modelFactory creates a match which is ready to be played. there is one snapshot with the start lineup.
            var match = modelFactory.createMatch(BoardSize.SMALL);
            assert.equal(match.history.length, 0);


            var current = match.getCurrentSnapshot();

            assert.ok(current);
            assert.equal(JSON.stringify(current), JSON.stringify(modelFactory.createStartSnapshot(BoardSize.SMALL)));
        });

        it("should return the last snapshot when there are more then one", function(){

            var match = modelFactory.createMatch(BoardSize.SMALL);

            var snapshot = modelFactory.createStartSnapshot(BoardSize.SMALL);

            // move the rocks from 1,1 to 1,2
            snapshot.getField(1,2).figure = snapshot.getField(1,1).figure;
            snapshot.getField(1,1).figure = undefined;


            match.history.push(new Move({figure: {color: Color.WHITE,type: FigureType.ROCKS},from: {column: 1,row: 1},to: {column: 1,row: 2}}));

            var current = match.getCurrentSnapshot();

            assert.ok(current);
            assert.isUndefined(current.getField(1,1).figure);
            assert.ok(current.getField(1,2).figure);
        });
    });

    describe("GenerateSnapshot function",function(){


        var match;

        beforeEach(function(){
            match  = modelFactory.createEmptyMatch(BoardSize.BIG);
        });


        it("should throw an Error if the requested number is greater than the history length",function(){
            assert.equal(match.history.length,0);
            assert.throws(function(){
                match.generateSnapshot(1);
            });
        });

        it("should return a new StartSnapshot if history is empty",function(){
            var expected = modelFactory.createStartSnapshot(BoardSize.BIG);
            var result = match.generateSnapshot(0);
            assert.ok(result);
            assert.equal(JSON.stringify(expected),JSON.stringify(result));
        });

        it("should return the Snapshot after three moves",function(){
            match.addMove(new Move({figure: {color: Color.WHITE,type: FigureType.ROCKS},from: {column: 1,row: 1},to: {column: 1,row: 2}}));
            match.addMove(new Move({figure: {color: Color.BLACK,type: FigureType.ROCKS},from: {column: 3,row: 7},to: {column: 3,row: 5}}));
            match.addMove(new Move({figure: {color: Color.WHITE,type: FigureType.KNIGHT},from: {column: 1,row: 0},to: {column: 2,row: 2}}));

            var snapshot1 = match.generateSnapshot(1);
            assert.notOk(snapshot1.getField(1,1).figure);
            assert.deepEqual(snapshot1.getField(1,2).figure,{color: Color.WHITE,type: FigureType.ROCKS});
            assert.deepEqual(snapshot1.getField(3,7).figure,{color: Color.BLACK,type: FigureType.ROCKS});
            assert.notOk(snapshot1.getField(3,5).figure);
            assert.deepEqual(snapshot1.getField(1,0).figure,{color: Color.WHITE,type: FigureType.KNIGHT});
            assert.notOk(snapshot1.getField(2,2).figure);

            var snapshot2 = match.generateSnapshot(2);
            assert.notOk(snapshot2.getField(1,1).figure);
            assert.deepEqual(snapshot2.getField(1,2).figure,{color: Color.WHITE,type: FigureType.ROCKS});
            assert.notOk(snapshot2.getField(3,7).figure);
            assert.deepEqual(snapshot2.getField(3,5).figure,{color: Color.BLACK,type: FigureType.ROCKS});
            assert.deepEqual(snapshot2.getField(1,0).figure,{color: Color.WHITE,type: FigureType.KNIGHT});
            assert.notOk(snapshot2.getField(2,2).figure);

            var snapshot3 = match.generateSnapshot(3);
            assert.notOk(snapshot3.getField(1,1).figure);
            assert.deepEqual(snapshot3.getField(1,2).figure,{color: Color.WHITE,type: FigureType.ROCKS});
            assert.notOk(snapshot3.getField(3,7).figure);
            assert.deepEqual(snapshot3.getField(3,5).figure,{color: Color.BLACK,type: FigureType.ROCKS});
            assert.notOk(snapshot3.getField(1,0).figure);
            assert.deepEqual(snapshot3.getField(2,2).figure,{color: Color.WHITE,type: FigureType.KNIGHT});
        });

        it("should throw a error of the Move can not be performed form the current Snapshot",function(){
            match.addMove(new Move({figure: {color: Color.WHITE,type: FigureType.ROCKS},from: {column: 5,row:4},to: {column: 1,row: 2}}));
            assert.throws(function(){
                match.generateSnapshot(1);
            });
        });
    });

    describe("AddPlayer function of Match", function(){

        var match;

        beforeEach(function(){
            match  = modelFactory.createEmptyMatch(BoardSize.BIG);
        });


        it("should contain no players after initialization", function(){
            assert.isUndefined(match.playerWhite);
            assert.isUndefined(match.playerBlack);
        });


        it("should add a player from a json param", function(){

            var result = match.addPlayer({playerId:1, name: "bob"});

            assert.isTrue(result);

            assert.ok(match.playerBlack);
            assert.instanceOf(match.playerBlack, model.Player);
            assert.equal(match.playerBlack.playerId, 1);
            assert.equal(match.playerBlack.name, "bob");

            assert.isUndefined(match.playerWhite); // white is still undefined.
        });

        it("should add a player from a Player instance param", function(){

            var bob = new model.Player({playerId:1, name:"bob"});

            match.addPlayer(bob);

            assert.ok(match.playerBlack);
            assert.equal(match.playerBlack.playerId, 1);
            assert.equal(match.playerBlack.name, "bob");

            assert.isUndefined(match.playerWhite); // white is still undefined.
        });

        it("should add a second player when one is already added", function(){
            match.addPlayer({playerId:1, name: "bob"});

            var result = match.addPlayer({playerId: 2, name: "alice"});

            assert.isTrue(result);

            assert.ok(match.playerBlack);
            assert.equal(match.playerBlack.playerId, 1);
            assert.equal(match.playerBlack.name, "bob");

            assert.ok(match.playerWhite);
            assert.equal(match.playerWhite.playerId, 2);
            assert.equal(match.playerWhite.name, "alice");
        });

        it("shouldn't add a third player when two are already added", function(){
            match.addPlayer({playerId:1, name: "bob"});

            match.addPlayer({playerId: 2, name: "alice"});

            var result = match.addPlayer({playerId: 3, name: "claus"});
            assert.isFalse(result);
        });
    });


    describe("AddMove function of Match", function () {
        var match;

        var validMove = {figure: {color: model.Color.BLACK, type: model.FigureType.ROCKS},
            from: {column: 2, row: 5},
            to: {column: 2, row: 4}};

        beforeEach(function(){
            match  = modelFactory.createEmptyMatch(BoardSize.SMALL);
        });

        it("should add a validMove given as JSON param", function () {
            var result = match.addMove(validMove);

            assert.isTrue(result);

            assert.equal(match.history.length, 1);
        });

        it("should add a validMove given as Move instance", function () {
            var result = match.addMove(new model.Move(validMove));

            assert.isTrue(result);

            assert.equal(match.history.length, 1);
        });

        it("should not add invalid JSON", function(){
            var result = match.addMove({something: "other"});

            assert.isFalse(result);

            assert.equal(match.history.length, 0);
        })

        it("should work with addMove2", function(){
           var result = match.addMove2(2,5,2,4);
           assert.isTrue(result);
           assert.equal(match.history.length, 1);

           assert.deepEqual(match.history[0].figure, {color: model.Color.BLACK, type: model.FigureType.ROCKS});
        });
    });


    describe("historyContainsMoveFrom",function(){
        it("should be return false on empty history",function(){
            var match = modelFactory.createMatch(BoardSize.SMALL);
            assert.equal(match.historyContainsMoveFrom(4,2),false);
        });
        it("should be return true",function(){
            var match = modelFactory.createMatch(BoardSize.SMALL);
            match.history.push(new Move({figure: {color: Color.WHITE,type: FigureType.ROCKS},from: {column: 1,row: 1},to: {column: 1,row: 2}}));
            assert.equal(match.historyContainsMoveFrom(1,1),true);
        });
    });
});




describe("GetField accessor function of Snapshot", function () {

    var rocks1 = new Figure({color: Color.BLACK, type: FigureType.ROCKS});
    var rocks2 = new Figure({color: Color.WHITE, type: FigureType.ROCKS});

    var snapshot = new Snapshot();
    snapshot.board.push(new Field({position:{column: 0, row: 0}}));
    snapshot.board.push(new Field({position:{column: 0, row: 1}}));
    snapshot.board.push(new Field({position:{column: 0, row: 2}, figure: rocks1}));
    snapshot.board.push(new Field({position:{column: 1, row: 0}}));
    snapshot.board.push(new Field({position:{column: 1, row: 1}}));
    snapshot.board.push(new Field({position:{column: 1, row: 2}}));
    snapshot.board.push(new Field({position:{column: 2, row: 0}, figure: rocks2}));
    snapshot.board.push(new Field({position:{column: 2, row: 1}}));
    snapshot.board.push(new Field({position:{column: 2, row: 2}}));

    it("should return the properly field", function () {

        var x0y0 = snapshot.getField(0, 0);
        assert.ok(x0y0);
        assert.instanceOf(x0y0, Field);


        var x0y2 = snapshot.getField(0, 2);
        assert.ok(x0y2);
        assert.deepEqual(x0y2.figure, rocks1);

    });

    it("should return undefined for out-of-bounds coordinates", function () {
        var x3y0 = snapshot.getField(3, 0);
        assert.isUndefined(x3y0);
    })
});


