/**
 * Created by erik Jähne on 09.05.2014.
 */


var assert = require("chai").assert;

var accessor = require("./board-accessor");
var model = require("./../model/model");
var gameLogic = require("./gamelogic");

var Color = model.Color;
var FigureType = model.FigureType;
var Position = model.Position;
var Figure = model.Figure;
var BoardSize = model.BoardSize;
var CheckType = gameLogic.CheckType;
var GameLogic = gameLogic.GameLogic;

var modelFactory = require("./../model/model-factory.js");


describe("gamelogic", function () {
    var match;
    var board;
    var logic;

    beforeEach(function () {
        match = modelFactory.createMatch(model.BoardSize.SMALL);
        board = match.getCurrentSnapshot();
        logic = new GameLogic(match);
    });

    describe("getZenithPosition",function(){
        it("should return start Position on start Snapshot",function(){
            var field = logic.getZenithPosition(Color.WHITE,board);
            assert.equal(field.position.column,3);
            assert.equal(field.position.row,0);
            var field = logic.getZenithPosition(Color.BLACK,board);
            assert.equal(field.position.column,3);
            assert.equal(field.position.row,6);
        });
    });

    describe("getCheckType",function() {
        it("should return CheckType.NONE on empty Bord", function () {
            assert.equal(logic.getCheckType(Color.BLACK), CheckType.NONE);
            assert.equal(logic.getCheckType(Color.WHITE), CheckType.NONE);
        });
        it("should return CheckType.NONE if Zenit is not threaden", function () {
            match.history.push(new model.Move({figure: board.getField(3,0).figure, from: new Position({column: 3, row: 0}), to: new Position({column: 2, row: 3})}));
            match.history.push(new model.Move({figure: board.getField(3,6).figure, from: new Position({column: 3, row: 6}), to: new Position({column: 4, row: 3})}));
            assert.equal(logic.getCheckType(Color.BLACK), CheckType.NONE);
            assert.equal(logic.getCheckType(Color.WHITE), CheckType.NONE);
            match.history.pop();
            match.history.pop();
        });
        it("should return CheckType.CHECK if Zenit is threaden from Rocks and Knight", function () {
            match.history.push(new model.Move({figure: board.getField(3,0).figure, from: new Position({column: 3, row: 0}), to: new Position({column: 2, row: 4})}));
            match.history.push(new model.Move({figure: board.getField(3,6).figure, from: new Position({column: 3, row: 6}), to: new Position({column: 2, row: 2})}));
            assert.equal(logic.getCheckType(Color.BLACK), CheckType.CHECK);
            assert.equal(logic.getCheckType(Color.WHITE), CheckType.CHECK);
            match.history.pop();
            match.history.pop();
        });
    });

    describe("isValidMove",function(){
        var match;
        var validMove = new model.Move({figure: {color: model.Color.BLACK, type: model.FigureType.ROCKS},
            from: {column: 2, row: 5},
            to: {column: 2, row: 4}});
        var invalidMove = new model.Move({figure: {color: model.Color.BLACK, type: model.FigureType.ROCKS},
            from: {column: 2, row: 5},
            to: {column: 3, row: 4}});

        beforeEach(function(){
            match  = modelFactory.createMatch(BoardSize.SMALL);
            match.playerBlack = {playerId: 1, name: 'player1'};
            match.playerWhite=  {playerId: 2, name: 'player2'};
            logic = new GameLogic(match);
        });

        it("should accept an validMove", function(){
            assert.isTrue(logic.isValidMove(1, validMove));
        });

        it("should not accept an invalidMove", function(){
            assert.isFalse(logic.isValidMove(1, invalidMove));
        });
    });

    describe("getValidMoves",function(){

    });

    describe.skip("isCheckMate",function(){

        beforeEach(function(){
           match = modelFactory.createEmptyMatch(BoardSize.BIG);
           match.playerBlack = {playerId: 1, name: 'player1'};
           match.playerWhite=  {playerId: 2, name: 'player2'};
           logic = new GameLogic(match);
        });


        it("should not be checkMate : protect Zenith by moving figure", function(){

            match.addMove2(3,7,3,5);
            match.addMove2(2,1,2,3);
            match.addMove2(2,8,6,4);
            match.addMove2(5,1,5,3);
            match.addMove2(6,4,7,3);

           // white Zenith is in check, but not checkmate because there are moves available to
           // protect the Zenith without moving the Zenith

            assert.equal(logic.getCheckType(Color.WHITE), CheckType.CHECK);
            assert.notEqual(logic.getCheckType(Color.WHITE), CheckType.CHECK_MATE);

        });

        it("should not be checkMate : protect Zenith by taking threatening figure", function(){
            match.addMove2(3,7,3,5);
            match.addMove2(2,1,2,3);
            match.addMove2(2,8,6,4);
            match.addMove2(5,1,5,3);
            match.addMove2(6,4,7,3);

            // white Zenith is in check, but not checkmate because there are moves available to
            // protect the Zenith without moving the Zenith

            match.addMove2(7,0,6,2);
            match.addMove2(7,8,6,6);
            match.addMove2(0,1,0,2);
            match.addMove2(6,6,4,5);
            match.addMove2(0,2,0,3);
            match.addMove2(4,5,3,3);
            match.addMove2(7,1,7,2);
            match.addMove2(6,7,6,5);
            match.addMove2(4,1,4,2);
            match.addMove2(7,3,6,2);

            //The White Zenith is now in check and can't move
            //The man can take the threatening woman of player black to protect the Zenith

            assert.equal(logic.getCheckType(Color.WHITE), CheckType.CHECK);
            assert.notEqual(logic.getCheckType(Color.WHITE), CheckType.CHECK_MATE);

        });

        it("should not be checkMate : protect Zenith with moving Belief", function(){

            match.addMove2(3,7,3,5);
            match.addMove2(2,1,2,3);
            match.addMove2(2,8,6,4);
            match.addMove2(5,1,5,3);
            match.addMove2(6,4,7,3);

            // white Zenith is in check, but not checkmate because there are moves available to
            // protect the Zenith without moving the Zenith

            match.addMove2(7,0,6,2);
            match.addMove2(7,8,6,6);
            match.addMove2(0,1,0,2);
            match.addMove2(6,6,4,5);
            match.addMove2(0,2,0,3);
            match.addMove2(4,5,3,3);
            match.addMove2(7,1,7,2);
            match.addMove2(6,7,6,5);
            match.addMove2(4,1,4,2);
            match.addMove2(7,3,6,2);

            //The White Zenith is now in check and can't move
            //The man can take the threatening woman of player black to protect the Zenith

            match.addMove2(8,0,6,2);
            match.addMove2(3,8,3,7);
            match.addMove2(4,2,4,3);
            match.addMove2(6,8,6,7);
            match.addMove2(3,0,8,5);
            match.addMove2(6,7,8,5);
            match.addMove2(5,3,5,4);
            match.addMove2(6,5,5,4);
            match.addMove2(6,2,7,3);
            match.addMove2(3,7,7,3);

            //Zenith is now in check and can't move
            //Other figure e.g. Belief has to be moved to protect Zenith

            assert.equal(logic.getCheckType(Color.WHITE), CheckType.CHECK);
            assert.notEqual(logic.getCheckType(Color.WHITE), CheckType.CHECK_MATE);

        });

        it("should be checkMate", function(){
            match.addMove2(3,7,3,5);
            match.addMove2(2,1,2,3);
            match.addMove2(2,8,6,4);
            match.addMove2(5,1,5,3);
            match.addMove2(6,4,7,3);

            // white Zenith is in check, but not checkmate because there are moves available to
            // protect the Zenith without moving the Zenith

            match.addMove2(7,0,6,2);
            match.addMove2(7,8,6,6);
            match.addMove2(0,1,0,2);
            match.addMove2(6,6,4,5);
            match.addMove2(0,2,0,3);
            match.addMove2(4,5,3,3);
            match.addMove2(7,1,7,2);
            match.addMove2(6,7,6,5);
            match.addMove2(4,1,4,2);
            match.addMove2(7,3,6,2);

            //The White Zenith is now in check and can't move
            //The man can take the threatening woman of player black to protect the Zenith

            match.addMove2(8,0,6,2);
            match.addMove2(3,8,3,7);
            match.addMove2(4,2,4,3);
            match.addMove2(6,8,6,7);
            match.addMove2(3,0,8,5);
            match.addMove2(6,7,8,5);
            match.addMove2(5,3,5,4);
            match.addMove2(6,5,5,4);
            match.addMove2(6,2,7,3);
            match.addMove2(3,7,7,3);

            //White Zenith is now in check and can't move
            //Other figure e.g. Belief has to be moved to protect white Zenith

            match.addMove2(5,0,6,2);
            match.addMove2(8,8,6,7);
            match.addMove2(0,6,0,7);
            match.addMove2(6,7,5,6);
            match.addMove2(8,1,8,3);
            match.addMove2(5,4,4,3);
            match.addMove2(0,0,0,1);
            match.addMove2(7,3,6,2);

            //Player white's Zenith can't move and is player White is checkmate

            assert.equal(logic.getCheckType(Color.WHITE), CheckType.CHECK);
            assert.equal(logic.getCheckType(Color.WHITE), CheckType.CHECK_MATE);
        });

    });

    describe.skip("isCheckFinish",function() {

        beforeEach(function () {
            match = modelFactory.createEmptyMatch(BoardSize.BIG);
            match.playerBlack = {playerId: 1, name: 'player1'};
            match.playerWhite = {playerId: 2, name: 'player2'};
            logic = new GameLogic(match);
        });

        it("should ...", function(){

        });
    });
});