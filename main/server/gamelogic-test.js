/**
 * Created by erik Jähne on 09.05.2014.
 */


var assert = require("chai").assert;

var accessor = require("./model/board-accessor");
var model = require("./model/model");
var GameLogic = require("./gamelogic");

var Color = model.Color;
var FigureType = model.FigureType;
var Figure = model.Figure;

var modelFactory = require("./model/model.factory");


describe("gamelogic", function () {
    var match;
    var board;
    var logic;

    beforeEach(function () {
        match = modelFactory.createMatch(model.BoardSize.SMALL);
        board = match.getCurrentSnapshot();
        board.getField(3, 0).figure = new Figure({type: FigureType.ZENITH, color: Color.WHITE});
        board.getField(3, 6).figure = new Figure({type: FigureType.ZENITH, color: Color.BLACK});
        // mocking the getCurrentSnapshot
        match.getCurrentSnapshot = function(){
            return board;
        };
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

    describe("isCheck",function() {
        it("should return false on empty Bord", function () {
            assert.equal(logic.isCheck(Color.BLACK), false);
            assert.equal(logic.isCheck(Color.WHITE), false);
        });
        it("should return false if Zenit is not threaden", function () {
            board.getField(3, 0).figure = undefined;
            board.getField(3, 6).figure = undefined;
            board.getField(2, 3).figure = new Figure({type: FigureType.ZENITH, color: Color.WHITE});
            board.getField(4, 3).figure = new Figure({type: FigureType.ZENITH, color: Color.BLACK});
            assert.equal(logic.isCheck(Color.BLACK), false);
            assert.equal(logic.isCheck(Color.WHITE), false);
        });
        it("should return true if Zenit is threaden from Rocks and Knight", function () {
            board.getField(3, 0).figure = undefined;
            board.getField(3, 6).figure = undefined;
            board.getField(2, 4).figure = new Figure({type: FigureType.ZENITH, color: Color.WHITE});
            board.getField(2, 2).figure = new Figure({type: FigureType.ZENITH, color: Color.BLACK});
            assert.equal(logic.isCheck(Color.BLACK), true);
            assert.equal(logic.isCheck(Color.WHITE), true);
        });
    });

    describe("getValidMoves",function(){

    });
});