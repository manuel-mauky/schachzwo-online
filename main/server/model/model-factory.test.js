"use strict"


var assert = require("chai").assert;
var model = require("./model");
var modelFactory = require("./model-factory.js");

var FigureType = model.FigureType;


describe("modelFactory.createMatch", function () {
    it("should create a valid match with a start snapshot", function () {
        var match = modelFactory.createMatch(model.BoardSize.SMALL);

        assert.ok(match);

        assert.equal(match.state, model.State.READY);

        assert.isArray(match.history);

        assert.equal(match.size, model.BoardSize.SMALL);

    });

    it("should throw an error when size param is wrong", function () {

        assert.throws(function () {
            modelFactory.createMatch();
        })

        assert.throws(function () {
            modelFactory.createMatch(8);
        })

    });
});

describe("modelFactory.createStartSnapshot", function () {

    it("should create a valid empty small board snapshot", function () {

        var snapshot = modelFactory.createStartSnapshot(model.BoardSize.SMALL);

        assert.ok(snapshot);
        assert.equal(snapshot.board.length, 49); // 7*7 fields

        assert.equal(snapshot.getField(0, 0).figure.type, FigureType.MAN);
        assert.equal(snapshot.getField(1, 0).figure.type, FigureType.KNIGHT);
        assert.equal(snapshot.getField(2, 0).figure.type, FigureType.WOMAN);
        assert.equal(snapshot.getField(3, 0).figure.type, FigureType.ZENITH);
        assert.equal(snapshot.getField(4, 0).figure.type, FigureType.WOMAN);
        assert.equal(snapshot.getField(5, 0).figure.type, FigureType.KNIGHT);
        assert.equal(snapshot.getField(6, 0).figure.type, FigureType.MAN);


        assert.equal(snapshot.getField(0, 6).figure.type, FigureType.MAN);
        assert.equal(snapshot.getField(1, 6).figure.type, FigureType.KNIGHT);
        assert.equal(snapshot.getField(2, 6).figure.type, FigureType.WOMAN);
        assert.equal(snapshot.getField(3, 6).figure.type, FigureType.ZENITH);
        assert.equal(snapshot.getField(4, 6).figure.type, FigureType.WOMAN);
        assert.equal(snapshot.getField(5, 6).figure.type, FigureType.KNIGHT);
        assert.equal(snapshot.getField(6, 6).figure.type, FigureType.MAN);


        // check the rocks
        for (var i = 0; i < 7; i++) {
            assert.equal(snapshot.getField(i, 1).figure.type, FigureType.ROCKS);
            assert.equal(snapshot.getField(i, 5).figure.type, FigureType.ROCKS);
        }


        // check that the zenith is in the center field
//        assert.equal(snapshot.getField(3,3).figure.type, FigureType.ZENITH);


    });

    it("should create a valid empty big board snapshot", function () {

        var snapshot = modelFactory.createStartSnapshot(model.BoardSize.BIG);
        assert.ok(snapshot);

        assert.equal(snapshot.board.length, 81); // 9*9 fields

        assert.equal(snapshot.getField(0, 0).figure.type, FigureType.MAN);
        assert.equal(snapshot.getField(1, 0).figure.type, FigureType.KNIGHT);
        assert.equal(snapshot.getField(2, 0).figure.type, FigureType.WOMAN);
        assert.equal(snapshot.getField(3, 0).figure.type, FigureType.FAITH);
        assert.notOk(snapshot.getField(4, 0).figure);  // at start the zeniths are placed on the origin in the middle of the field
        assert.equal(snapshot.getField(5, 0).figure.type, FigureType.KNOWLEDGE)
        assert.equal(snapshot.getField(6, 0).figure.type, FigureType.WOMAN);
        assert.equal(snapshot.getField(7, 0).figure.type, FigureType.KNIGHT);
        assert.equal(snapshot.getField(8, 0).figure.type, FigureType.MAN);

        assert.equal(snapshot.getField(0, 8).figure.type, FigureType.MAN);
        assert.equal(snapshot.getField(1, 8).figure.type, FigureType.KNIGHT);
        assert.equal(snapshot.getField(2, 8).figure.type, FigureType.WOMAN);
        assert.equal(snapshot.getField(3, 8).figure.type, FigureType.FAITH);
        assert.notOk(snapshot.getField(4, 8).figure);  // at start the zeniths are placed on the origin in the middle of the field
        assert.equal(snapshot.getField(5, 8).figure.type, FigureType.KNOWLEDGE)
        assert.equal(snapshot.getField(6, 8).figure.type, FigureType.WOMAN);
        assert.equal(snapshot.getField(7, 8).figure.type, FigureType.KNIGHT);
        assert.equal(snapshot.getField(8, 8).figure.type, FigureType.MAN);


        for (var i = 0; i < 9; i++) {
            assert.equal(snapshot.getField(i, 1).figure.type, FigureType.ROCKS);
            assert.equal(snapshot.getField(i, 7).figure.type, FigureType.ROCKS);
        }

        // check that the zenith is in the center field
//        assert.equal(snapshot.getField(4,4).figure.type, FigureType.ZENITH);

    });

    it("should throw an error when the size param is wrong", function () {

        assert.throws(function () {
            modelFactory.createStartSnapshot(); // empty param
        });


        assert.throws(function () {
            modelFactory.createStartSnapshot(8); // wrong size
        });
    });

});