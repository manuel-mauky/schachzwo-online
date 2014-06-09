/**
 * Created by erik Jähne on 09.05.2014.
 */

"use strict";

var assert = require("chai").assert;

var BoardAccessor = require("./board-accessor");
var model = require("./../model/model");
var gameLogic = require("./gamelogic");

var Color = require("../model/color")
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
            match.historyPush(new model.Move({figure: board.getField(3,0).figure, from: new Position({column: 3, row: 0}), to: new Position({column: 2, row: 3})}));
            match.historyPush(new model.Move({figure: board.getField(3,6).figure, from: new Position({column: 3, row: 6}), to: new Position({column: 4, row: 3})}));
            assert.equal(logic.getCheckType(Color.BLACK), CheckType.NONE);
            assert.equal(logic.getCheckType(Color.WHITE), CheckType.NONE);
            match.historyPop();
            match.historyPop();
        });
        it("should return CheckType.CHECK if Zenit is threaden from Rocks and Knight on White Player", function () {
            match.historyPush(new model.Move({figure: board.getField(3,0).figure, from: new Position({column: 3, row: 0}), to: new Position({column: 2, row: 4})}));
            assert.equal(logic.getCheckType(Color.WHITE), CheckType.CHECK);
            assert.equal(logic.getCheckType(Color.BLACK), CheckType.NONE);
            match.historyPop();
        });

        it("should return CheckType.CHECK if Zenit is threaden from Rocks and Knight on Black Player", function () {
            match.historyPush(new model.Move({figure: board.getField(3,6).figure, from: new Position({column: 3, row: 6}), to: new Position({column: 2, row: 2})}));
            assert.equal(logic.getCheckType(Color.WHITE), CheckType.NONE);
            assert.equal(logic.getCheckType(Color.BLACK), CheckType.CHECK);
            match.historyPop();
        });
    });

    describe("bug: player moves without user interaction",function(){

        it("white player should not do a move on its own", function(){
           match = modelFactory.createEmptyMatch(BoardSize.SMALL);
           match.playerBlack = {playerId: 1, name: 'player1'};
           match.playerWhite = {playerId: 2, name: 'player2'};
           logic = new GameLogic(match);

           assert.isTrue(match.addMove2(4,5,4,4));
           assert.isTrue(match.addMove2(5,1,5,2));
           assert.isTrue(match.addMove2(4,4,4,3));
           assert.isTrue(match.addMove2(5,2,4,3));
           assert.isTrue(match.addMove2(5,5,5,4));
           assert.isTrue(match.addMove2(4,3,4,4));
           assert.isTrue(match.addMove2(4,6,6,4));
           assert.isTrue(match.addMove2(6,1,6,2));
           assert.isTrue(match.addMove2(5,4,5,3));
           assert.isTrue(match.addMove2(4,4,4,5));
           assert.isTrue(match.addMove2(3,6,4,5));
           assert.isTrue(match.addMove2(4,1,4,2));
           assert.isTrue(match.addMove2(5,3,4,2));
           assert.isTrue(match.addMove2(3,1,3,2));
           assert.isTrue(match.addMove2(6,4,6,3));

           assert.equal(match.getCurrentSnapshot().getField(5,2).figure, undefined); // undefined


        });

    });

    describe("isCheckMate",function(){

        beforeEach(function(){
           match = modelFactory.createEmptyMatch(BoardSize.BIG);
           match.playerBlack = {playerId: 1, name: 'player1'};
           match.playerWhite=  {playerId: 2, name: 'player2'};
           logic = new GameLogic(match);
        });


        it("should not be checkMate : protect Zenith by moving figure", function(){
            assert.isTrue(match.addMove2(3,7,3,5));
            assert.isTrue(match.addMove2(2,1,2,3));
            assert.isTrue(match.addMove2(2,8,6,4));
            assert.isTrue(match.addMove2(5,1,5,3));
            assert.isTrue(match.addMove2(6,4,7,3));

           // white Zenith is in check, but not checkmate because there are moves available to
           // protect the Zenith without moving the Zenith

            var currentCheckType = logic.getCheckType(Color.WHITE);
            assert.equal(currentCheckType, CheckType.CHECK);
            assert.notEqual(currentCheckType, CheckType.CHECK_MATE);

        });

        it("should not be checkMate : protect Zenith by taking threatening figure", function(){
            assert.isTrue(match.addMove2(3,7,3,5));
            assert.isTrue(match.addMove2(2,1,2,3));
            assert.isTrue(match.addMove2(2,8,6,4));
            assert.isTrue(match.addMove2(5,1,5,3));
            assert.isTrue(match.addMove2(6,4,7,3));

            // white Zenith is in check, but not checkmate because there are moves available to
            // protect the Zenith without moving the Zenith

            assert.isTrue(match.addMove2(7,0,6,2));
            assert.isTrue(match.addMove2(7,8,6,6));
            assert.isTrue(match.addMove2(0,1,0,2));
            assert.isTrue(match.addMove2(6,6,4,5));
            assert.isTrue(match.addMove2(0,2,0,3));
            assert.isTrue(match.addMove2(4,5,3,3));
            assert.isTrue(match.addMove2(7,1,7,2));
            assert.isTrue(match.addMove2(6,7,6,5));
            assert.isTrue(match.addMove2(4,1,4,2));
            assert.isTrue(match.addMove2(7,3,6,2));

            //The White Zenith is now in check and can't move
            //The man can take the threatening woman of player black to protect the Zenith

            assert.equal(logic.getCheckType(Color.WHITE), CheckType.CHECK);
            assert.notEqual(logic.getCheckType(Color.WHITE), CheckType.CHECK_MATE);

        });

        it("should not be checkMate : protect Zenith with moving Belief", function(){
            assert.isTrue(match.addMove2(3,7,3,5));
            assert.isTrue(match.addMove2(2,1,2,3));
            assert.isTrue(match.addMove2(2,8,6,4));
            assert.isTrue(match.addMove2(5,1,5,3));
            assert.isTrue(match.addMove2(6,4,7,3));

            // white Zenith is in check, but not checkmate because there are moves available to
            // protect the Zenith without moving the Zenith

            assert.isTrue(match.addMove2(7,0,6,2));
            assert.isTrue(match.addMove2(7,8,6,6));
            assert.isTrue(match.addMove2(0,1,0,2));
            assert.isTrue(match.addMove2(6,6,4,5));
            assert.isTrue(match.addMove2(0,2,0,3));
            assert.isTrue(match.addMove2(4,5,3,3));
            assert.isTrue(match.addMove2(7,1,7,2));
            assert.isTrue(match.addMove2(6,7,6,5));
            assert.isTrue(match.addMove2(4,1,4,2));
            assert.isTrue(match.addMove2(7,3,6,2));

            //The White Zenith is now in check and can't move
            //The man can take the threatening woman of player black to protect the Zenith

            assert.isTrue(match.addMove2(8,0,6,2));
            assert.isTrue(match.addMove2(3,8,3,7));
            assert.isTrue(match.addMove2(4,2,4,3));
            assert.isTrue(match.addMove2(6,8,6,7));
            assert.isTrue(match.addMove2(3,0,8,5));
            assert.isTrue(match.addMove2(6,7,8,5));
            assert.isTrue(match.addMove2(5,3,5,4));
            assert.isTrue(match.addMove2(6,5,5,4));
            assert.isTrue(match.addMove2(6,2,7,3));
            assert.isTrue(match.addMove2(3,7,7,3));

            //Zenith is now in check and can't move
            //Other figure e.g. Belief has to be moved to protect Zenith
            assert.equal(logic.getCheckType(Color.WHITE), CheckType.CHECK);
            assert.notEqual(logic.getCheckType(Color.WHITE), CheckType.CHECK_MATE);

        });

        it("should be checkMate", function(){
            assert.isTrue(match.addMove2(3,7,3,5));
            assert.isTrue(match.addMove2(2,1,2,3));
            assert.isTrue(match.addMove2(2,8,6,4));
            assert.isTrue(match.addMove2(5,1,5,3));
            assert.isTrue(match.addMove2(6,4,7,3));

            // white Zenith is in check, but not checkmate because there are moves available to
            // protect the Zenith without moving the Zenith

            assert.isTrue(match.addMove2(7,0,6,2));
            assert.isTrue(match.addMove2(7,8,6,6));
            assert.isTrue(match.addMove2(6,0,7,0));
            assert.isTrue(match.addMove2(0,7,0,5));
            assert.isTrue(match.addMove2(0,1,0,2));
            assert.isTrue(match.addMove2(6,6,4,5));
            assert.isTrue(match.addMove2(0,2,0,3));
            assert.isTrue(match.addMove2(4,5,3,3));
            assert.isTrue(match.addMove2(7,1,7,2));
            assert.isTrue(match.addMove2(6,7,6,5));
            assert.isTrue(match.addMove2(4,1,4,2));
            assert.isTrue(match.addMove2(7,3,6,2));

            //The White Zenith is now in check and can't move
            //The man can take the threatening woman of player black to protect the Zenith

            assert.isTrue(match.addMove2(8,0,6,2));
            assert.isTrue(match.addMove2(3,8,3,7));
            assert.isTrue(match.addMove2(4,2,4,3));
            assert.isTrue(match.addMove2(6,8,6,7));
            assert.isTrue(match.addMove2(3,0,8,5));
            assert.isTrue(match.addMove2(6,7,8,5));
            assert.isTrue(match.addMove2(5,3,5,4));
            assert.isTrue(match.addMove2(6,5,5,4));
            assert.isTrue(match.addMove2(6,2,7,3));
            assert.isTrue(match.addMove2(3,7,7,3));

            //White Zenith is now in check and can't move
            //Other figure e.g. Belief has to be moved to protect white Zenith

            assert.isTrue(match.addMove2(5,0,6,2));
            assert.isTrue(match.addMove2(8,8,6,7));
            assert.isTrue(match.addMove2(0,5,0,4));
            assert.isTrue(match.addMove2(6,7,5,6));
            assert.isTrue(match.addMove2(8,1,8,3));
            assert.isTrue(match.addMove2(5,4,4,3));
            assert.isTrue(match.addMove2(0,0,0,1));
            assert.isTrue(match.addMove2(7,3,6,2));

            //Player white's Zenith can't move and is player White is checkmate

            //assert.equal(logic.getCheckType(Color.WHITE), CheckType.CHECK);
            assert.equal(logic.getCheckType(Color.WHITE), CheckType.CHECK_MATE);
        });

    });

    describe("isStateMate", function(){

        var accessor;

        beforeEach(function(){
            match = modelFactory.createEmptyMatch(BoardSize.SMALL);
            match.playerBlack = {playerId: 1, name: 'player1'};
            match.playerWhite=  {playerId: 2, name: 'player2'};
            logic = new GameLogic(match);

            accessor = new BoardAccessor(match);
        });

        it("should work", function(){
            assert.isTrue(match.addMove2(3,5,3,4));
            assert.isTrue(match.addMove2(4,1,4,2));

            assert.isTrue(match.addMove2(4,5,4,4));
            assert.isTrue(match.addMove2(4,2,4,3));

            assert.isTrue(match.addMove2(5,6,6,4));
            assert.isTrue(match.addMove2(4,3,3,4)); // capture black rocks

            assert.isTrue(match.addMove2(6,4,5,2));
            assert.isTrue(match.addMove2(6,1,5,2)); // capture black knight

            assert.isTrue(match.addMove2(4,4,4,3));
            assert.isTrue(match.addMove2(5,2,4,3)); // capture black rocks

            assert.isTrue(match.addMove2(5,5,5,4));
            assert.isTrue(match.addMove2(4,3,5,4)); // capture black rocks

            assert.isTrue(match.addMove2(4,6,4,5));
            assert.isTrue(match.addMove2(3,4,4,5)); // capture black woman

            assert.isTrue(match.addMove2(3,6,4,6));
            assert.isTrue(match.addMove2(5,4,6,5)); // capture black rocks

            assert.isTrue(match.addMove2(6,6,6,5)); // capture white rocks
            assert.isTrue(match.addMove2(1,0,0,2));

            assert.isTrue(match.addMove2(6,5,6,2));
            assert.isTrue(match.addMove2(5,1,6,2)); // capture black man

            assert.isTrue(match.addMove2(1,5,1,4));
            assert.isTrue(match.addMove2(0,2,1,4)); // capture black rocks


            assert.isTrue(match.addMove2(1,6,0,4));
            assert.isTrue(match.addMove2(1,4,2,6)); // capture black woman

            assert.isTrue(match.addMove2(0,6,1,4));
            assert.isTrue(match.addMove2(2,6,1,4)); // capture black man

            assert.isTrue(match.addMove2(2,5,2,4));
            assert.isTrue(match.addMove2(5,0,4,2));

            assert.isTrue(match.addMove2(2,4,2,3));
            assert.isTrue(match.addMove2(4,2,2,3)); // capture black rocks

            assert.isTrue(match.addMove2(0,5,1,4)); // capture white knight
            assert.isTrue(match.addMove2(2,3,0,4)); // capture black knight

            assert.isTrue(match.addMove2(4,6,4,5)); // capture white rocks
            assert.isTrue(match.addMove2(4,0,4,1));

            assert.isTrue(match.addMove2(1,4,1,3));
            assert.isTrue(match.addMove2(2,1,2,2));

            assert.isTrue(match.addMove2(4,5,4,6));
            assert.isTrue(match.addMove2(2,2,1,3)); // now white has only the zenith

            assert.isTrue(match.addMove2(4,6,3,6));
            assert.isTrue(match.addMove2(2,0,2,1));

            assert.isTrue(match.addMove2(3,6,4,6));
            assert.isTrue(match.addMove2(2,1,4,3));

            assert.isTrue(match.addMove2(4,6,3,6));
            assert.isTrue(match.addMove2(4,3,4,4));

            assert.isTrue(match.addMove2(3,6,4,6));
            assert.isTrue(match.addMove2(4,1,2,3));

            assert.isTrue(match.addMove2(4,6,3,6));
            assert.isTrue(match.addMove2(2,3,2,4)); // now the white zenith can't move but isn't in check

            assert.equal(logic.getCheckType(Color.BLACK), CheckType.STALE_MATE);
        });
    });

    describe("isCheckFinish",function() {

        beforeEach(function () {
            match = modelFactory.createEmptyMatch(BoardSize.BIG);
            match.playerBlack = {playerId: 1, name: 'player1'};
            match.playerWhite = {playerId: 2, name: 'player2'};
            logic = new GameLogic(match);
        });

        it("should result in Check Finish Both", function(){

            assert.isTrue(match.addMove2(4,7,4,5));
            assert.isTrue(match.addMove2(3,1,3,3));
            assert.isTrue(match.addMove2(4,8,4,7));
            assert.isTrue(match.addMove2(4,0,3,1));
            assert.isTrue(match.addMove2(4,7,5,6));
            assert.isTrue(match.addMove2(3,1,4,2));
            assert.isTrue(match.addMove2(5,6,5,5));
            assert.isTrue(match.addMove2(4,2,4,3));
            assert.isTrue(match.addMove2(5,5,4,4));
            //assert.isTrue(match.addMove2(4,3,4,4)); //weiß

            assert.equal(logic.getCheckType(Color.WHITE), CheckType.CHECK_TARGET_BOTH);
            //assert.equal(logic.getCheckType(Color.WHITE), CheckType.CHECK_TARGET_BOTH);
        });

        it("should result in Check TARGET for player WHITE", function(){

            assert.isTrue(match.addMove2(4,7,4,5));
            assert.isTrue(match.addMove2(3,1,3,3));
            assert.isTrue(match.addMove2(4,8,4,7));
            assert.isTrue(match.addMove2(2,1,2,3));
            assert.isTrue(match.addMove2(4,7,5,6));
            assert.isTrue(match.addMove2(4,1,4,2));
            assert.isTrue(match.addMove2(5,6,5,5));
            assert.isTrue(match.addMove2(2,3,2,4));
            assert.isTrue(match.addMove2(5,5,4,4));

            assert.equal(logic.getCheckType(Color.WHITE), CheckType.CHECK_TARGET);
        });
    });
});