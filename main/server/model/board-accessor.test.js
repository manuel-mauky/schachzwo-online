"use strict"
/**
 Test for board accessor logic.
 */



var assert = require("chai").assert;

var BoardAccessor = require("./board-accessor");

var model = require("./model");

var Color = model.Color;
var FigureType = model.FigureType;
var Figure = model.Figure;

var modelFactory = require("./model.factory");


describe("getRangeFor", function () {
    var accessor;
    var match;
    var board;

    beforeEach(function () {
        match = modelFactory.createMatch(model.BoardSize.SMALL);
        board = match.history[0];
        accessor = new BoardAccessor(match);
    });


    it("should return an empty array when there is no figure on this position", function () {
        var range = accessor.getRangeFor(2, 2); // empty field

        assert.isArray(range);
        assert.equal(range.length, 0);
    });


    describe("Rocks", function () {

        it("should be one field upwards for black from start", function () {
            var range = accessor.getRangeFor(0, 5);  // left black rocks

            assert.isArray(range);
            assert.equal(range.length, 1);

            assert.include(range, {column: 0, row: 4});

        })

        it("should be one field downwards for white from start", function () {
            var range = accessor.getRangeFor(0, 1); // left white rocks

            assert.isArray(range);
            assert.equal(range.length, 1);


            assert.include(range, {column: 0, row: 2});

        });

        it("should be two diagonal fields next to the origin when black rocks is below origin", function () {

            board.getField(3, 4).figure = new Figure({type: FigureType.ROCKS, color: Color.BLACK});
            var range = accessor.getRangeFor(3, 4); //


            assert.isArray(range);
            assert.equal(range.length, 2);

            assert.include(range, {column: 2, row: 3});
            assert.include(range, {column: 4, row: 3});
        });

        it("should be two diagonal fields next to the origin when white rocks is on top of origin", function () {

            board.getField(3, 2).figure = new Figure({type: FigureType.ROCKS, color: Color.WHITE});
            var range = accessor.getRangeFor(3, 2); //


            assert.isArray(range);
            assert.equal(range.length, 2);

            assert.include(range, {column: 2, row: 3});
            assert.include(range, {column: 4, row: 3});
        });

        it("should only contain one field next to the origin when the other side is blocked by own figure", function () {
            board.getField(3, 2).figure = new Figure({type: FigureType.ROCKS, color: Color.WHITE});
            board.getField(4, 3).figure = new Figure({type: FigureType.ROCKS, color: Color.WHITE});


            var range = accessor.getRangeFor(3, 2); //


            assert.isArray(range);
            assert.equal(range.length, 1);

            assert.include(range, {column: 2, row: 3});
        });

        it("should contain two fields next to origin when one is blocked by an enemy figure that can be taken", function () {
            board.getField(3, 2).figure = new Figure({type: FigureType.ROCKS, color: Color.WHITE});
            var range = accessor.getRangeFor(3, 2); //


            assert.isArray(range);
            assert.equal(range.length, 2);

            assert.include(range, {column: 2, row: 3});
            assert.include(range, {column: 4, row: 3});
        });

        it("should be empty when there is a figure in front of the rocks", function () {

            board.getField(3, 2).figure = new Figure({type: FigureType.ROCKS, color: Color.WHITE});
            board.getField(4, 3).figure = new Figure({type: FigureType.ROCKS, color: Color.BLACK}); // enemy

            var range = accessor.getRangeFor(3, 2);

            assert.isArray(range);
            assert.equal(range.length, 2);
            assert.include(range, {column: 2, row: 3});
            assert.include(range, {column: 4, row: 3});
        });

        it("should include a figure that can be taken", function () {
            board.getField(0, 2).figure = new Figure({type: FigureType.ROCKS, color: Color.BLACK});
            board.getField(1, 2).figure = new Figure({type: FigureType.ROCKS, color: Color.BLACK});

            var range = accessor.getRangeFor(0, 1);

            assert.equal(range.length, 1);
            assert.include(range, {column: 1, row: 2});
        });

        it("should not include an own figure that could be taken otherwise", function () {
            board.getField(0, 2).figure = new Figure({type: FigureType.ROCKS, color: Color.BLACK});
            board.getField(1, 2).figure = new Figure({type: FigureType.ROCKS, color: Color.WHITE}); // white can't take another white figure.


            var range = accessor.getRangeFor(0, 1);
            assert.isArray(range);
            assert.equal(range.length, 0);
        });


        it("should include two fields in front when its the big board size and the rocks is on the start position", function () {

            // we need to redefine the match for big size.
            var match = modelFactory.createMatch(model.BoardSize.BIG);
            var board = match.getCurrentSnapshot();
            var accessor = new BoardAccessor(match);


            var range = accessor.getRangeFor(0, 1);

            assert.equal(range.length, 2);

            assert.include(range, {column: 0, row: 2});
            assert.include(range, {column: 0, row: 3});
        });

    });
})

describe("Instantiation of BoardAccessor", function () {

    it("should use a Match as param", function () {

        var board = modelFactory.createStartSnapshot(model.BoardSize.SMALL);

        var accessor = new BoardAccessor(board);

        assert.ok(accessor);
    });

    it("should fail when no match param is available", function () {

        assert.throws(function () {
            new BoardAccessor();
        });
    });

});