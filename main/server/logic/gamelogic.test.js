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

    describe("isCheckMate",function(){

        beforeEach(function(){
           match = modelFactory.createEmptyMatch(BoardSize.BIG);
           match.playerBlack = {playerId: 1, name: 'player1'};
           match.playerWhite=  {playerId: 2, name: 'player2'};
           logic = new GameLogic(match);
        });

        it("should blah ", function(){
            //alle moves die zum gewünschen zustand führen hintereinander ausführen
           match.addMove2(2,7,2,6);

            //Reihe von Zügen, die zum Ausgangszustand für verschiedene Situationen führen
            //aufstellen
            

            //liefert true oder false
            logic.isCheckMate(Color.BLACK);
        });

    });
});