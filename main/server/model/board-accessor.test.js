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

    it("should return an empty array when there is no figure on this position", function () {
        match = modelFactory.createMatch(model.BoardSize.SMALL);
        accessor = new BoardAccessor(match);

        var range = accessor.getRangeFor(2, 2); // empty field

        assert.isArray(range);
        assert.equal(range.length, 0);
    });


    describe("Rocks", function () {

        beforeEach(function () {
            match = modelFactory.createMatch(model.BoardSize.SMALL);
            board = match.history[0];
            accessor = new BoardAccessor(match);
        });

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

    describe.skip("Man", function (){

        beforeEach(function () {
            match = modelFactory.createEmptyMatch(model.BoardSize.SMALL);
            board = match.history[0];
            accessor = new BoardAccessor(match);
        });

        it("should be empty at the begin as there are figures around the man", function(){
            // we create a match with the start lineup for this test.
            match = modelFactory.createMatch(model.BoardSize.SMALL);
            accessor = new BoardAccessor(match);


            var range = accessor.getRangeFor(0,0); // right black man.

            assert.isArray(range);
            assert.equal(range.length, 0);
        });

        it("should include the row and column", function(){
            board.getField(1, 4).figure = new Figure({type:FigureType.MAN, color: Color.BLACK});

            var range = accessor.getRangeFor(1,4);

            assert.isArray(range);

            // include the column without the current field (1,4)
            assert.include(range, {column: 1, row: 0});
            assert.include(range, {column: 1, row: 1});
            assert.include(range, {column: 1, row: 2});
            assert.include(range, {column: 1, row: 3});
            assert.include(range, {column: 1, row: 5});
            assert.include(range, {column: 1, row: 6});

            // include the row without the current field.
            assert.include(range, {column: 0, row: 4});
            assert.include(range, {column: 2, row: 4});
            assert.include(range, {column: 3, row: 4});
            assert.include(range, {column: 4, row: 4});
            assert.include(range, {column: 5, row: 4});
            assert.include(range, {column: 6, row: 4});
        });


        it("should not include fields behind an own or enemy figure in the way", function(){
            board.getField(1, 4).figure = new Figure({type:FigureType.MAN, color: Color.BLACK});

            board.getField(3, 4).figure = new Figure({type:FigureType.ROCKS, color: Color.BLACK}); // my own figure on the same row
            board.getField(1, 2).figure = new Figure({type:FigureType.ROCKS, color: Color.WHITE}); // enemy figure on the same column

            var range = accessor.getRangeFor(1,4);

            assert.notInclude(range, {column:4, row: 4});
            assert.notInclude(range, {column:5, row: 4});
            assert.notInclude(range, {column:6, row: 4});

            assert.notInclude(range, {column: 1, row: 1});
            assert.notInclude(range, {column: 1, row: 0});
        });

        it("should include diagonal fields in distance of one", function(){
            board.getField(1, 4).figure = new Figure({type:FigureType.MAN, color: Color.BLACK});

            var range = accessor.getRangeFor(1,4);

            assert.include(range, {column: 0, row: 3});
            assert.include(range, {column: 2, row: 3});
            assert.include(range, {column: 0, row: 5});
            assert.include(range, {column: 2, row: 5});
        });

        it("should not include fields with your own figures", function(){
            board.getField(1, 4).figure = new Figure({type:FigureType.MAN, color: Color.BLACK});
            board.getField(2, 4).figure = new Figure({type:FigureType.ROCKS, color: Color.BLACK});

            var range = accessor.getRangeFor(1,4);

            assert.notInclude(range, {column: 2, row: 4});
        });

        it("should include figures of the enemy", function(){
            board.getField(1, 4).figure = new Figure({type:FigureType.MAN, color: Color.BLACK});
            board.getField(2, 4).figure = new Figure({type:FigureType.ROCKS, color: Color.WHITE});

            var range = accessor.getRangeFor(1,4);

            assert.include(range, {column: 2, row: 4});
        });

        it("should not include the origin", function(){
            board.getField(1, 3).figure = new Figure({type:FigureType.MAN, color: Color.BLACK});
            var range = accessor.getRangeFor(1,3);

            assert.notInclude(range, {column: 3, row: 3});
        });

        it("should include two fields diagonal from the start position when it wasn't moved yet for big boards", function(){
            // we create a big board for this test.
            match = modelFactory.createEmptyMatch(model.BoardSize.BIG);
            accessor = new BoardAccessor(match);

            board.getField(0,8).figure = new Figure({type:FigureType.MAN, color: Color.BLACK});

            var range = accessor.getRangeFor(0, 8);

            assert.include(range, {column: 1, row: 6});
            assert.include(range, {column: 2, row: 6});
            assert.include(range, {column: 2, row: 7});

        });

        it("should only include those two-distance-diagonal fields that aren't blocked by enemy figures", function(){
           // the rules say that from the start the man can go 2 fields in every direction but only
           // when there is no figure in the way.


            // we create a big board for this test.
            match = modelFactory.createEmptyMatch(model.BoardSize.SMALL);
            accessor = new BoardAccessor(match);


            board.getField(0,8).figure = new Figure({type:FigureType.MAN, color: Color.BLACK});
            board.getField(1,7).figure = new Figure({type:FigureType.ROCKS, color: Color.BLACK});

            var range = accessor.getRangeFor(0, 8);

            assert.include(range, {column: 1, row: 6});
            assert.notInclude(range, {column: 2, row: 6}); // this field isn't reachable
            assert.include(range, {column: 2, row: 7});
        });


        it("should include fields behind the origin", function(){
            board.getField(1, 3).figure = new Figure({type:FigureType.MAN, color: Color.BLACK});
            var range = accessor.getRangeFor(1,3);

            assert.include(range, {column: 4, row: 3});
        })

    });

    describe.skip("Woman", function() {
        beforeEach(function () {
            match = modelFactory.createMatch(model.BoardSize.SMALL);
            board = match.history[0];
            accessor = new BoardAccessor(match);
        });

        it("should be empty at the begin as there are figures around the woman", function(){
            throw new Error("not tested yet");
        });

        it("should include the diagonals", function(){
            throw new Error("not tested yet");
        });


        it("should not include fields behind an own or enemy figure in the way", function(){
            throw new Error("not tested yet");
        });

        it("should include vertical and horizontal fields in distance of one", function(){
            throw new Error("not tested yet");
        });

        it("should not include fields with your own figures", function(){
            throw new Error("not tested yet");
        });

        it("should include figures of the enemy", function(){
            throw new Error("not tested yet");
        });

        it("should not include the origin", function(){
            throw new Error("not tested yet");
        });

        it("should include fields behind the origin", function(){
            throw new Error("not tested yet");
        })
    });

    describe.skip("Knight", function() {
        beforeEach(function () {
            match = modelFactory.createMatch(model.BoardSize.SMALL);
            board = match.history[0];
            accessor = new BoardAccessor(match);
        });

        it("should include the typical knight positions", function(){
            throw new Error("not tested yet");
        });

        it("should not include fields with your own figures", function(){
            throw new Error("not tested yet");
        });

        it("should include figures of the enemy", function(){
            throw new Error("not tested yet");
        });

        it("should not include the origin", function(){
            throw new Error("not tested yet");
        })

    });

    describe.skip("Zenith", function() {
        beforeEach(function () {
            match = modelFactory.createMatch(model.BoardSize.SMALL);
            board = match.history[0];
            accessor = new BoardAccessor(match);
        });

        it("should include one field in every direction", function(){
            throw new Error("not tested yet");
        });

        it("should include the origin", function(){
            throw new Error("not tested yet");
        });

        it("should include the origin even if the other zenith is already there", function(){
            throw new Error("not tested yet");
        });

        it("should not include fields where the zenith would be in check", function(){
            throw new Error("not tested yet");
        });

        it("should not include the origin when the zenith is in check", function() {
            throw new Error("not tested yet");
        });

        it("should include the origin even if the origin would be threatened by the enemy", function(){
            throw new Error("not tested yet");
        });

        it("should include field with enemy figures", function(){
            throw new Error("not tested yet");
        });

        it("should not include fields with the enemy zenith", function(){
            throw new Error("not tested yet");
        });

        it("should not include fields with own figures", function(){
            throw new Error("not tested yet");
        });
    });

    describe.skip("Knowledge", function() {
        beforeEach(function () {
            match = modelFactory.createMatch(model.BoardSize.BIG);
            board = match.history[0];
            accessor = new BoardAccessor(match);
        });

        it("should include the diagonals", function(){
            throw new Error("not tested yet");
        });

        it("should include the row and column", function(){
            throw new Error("not tested yet");
        });

        it("should include fields with enemy figures", function(){
            throw new Error("not tested yet");
        });

        it("should not include fields with own figures", function(){
            throw new Error("not tested yet");
        });

        it("should not include fields behind enemy or own figures", function(){
            throw new Error("not tested yet");
        });

        it("should not include the origin", function(){
            throw new Error("not tested yet");
        });

        it("should include fields behind the origin", function(){
            throw new Error("not tested yet");
        });


    });

    describe.skip("Faith", function() {
        beforeEach(function () {
            match = modelFactory.createMatch(model.BoardSize.BIG);
            board = match.history[0];
            accessor = new BoardAccessor(match);
        });


        it("should include a 5x5 matrix on an empty board", function(){
            throw new Error("not tested yet");
        });

        it("should only include those fields that can be reaced by two moves", function(){
            throw new Error("not tested yet");
        });

        it("should not include the origin", function(){
            throw new Error("not tested yet");
        });

        it("should include fields with enemy figures", function(){
            throw new Error("not tested yet");
        });

        it("should not include fields with own figures", function(){
            throw new Error("not tested yet");
        });

    });
});

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