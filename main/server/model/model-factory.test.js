"use strict"


var assert = require("chai").assert;
var model = require("./model");
var modelFactory = require("./model-factory.js");

var PieceType = require("./piece-type");
var Color = require("./color");
var BoardSize = require("./boardsize");
var State = require("./state");


describe("modelFactory.createMatch", function () {
    it("should create a valid match with a start snapshot", function () {
        var match = modelFactory.createMatch(BoardSize.SMALL);

        assert.ok(match);

        assert.equal(match.state, State.PREPARING);

        assert.isArray(match.history);

        assert.equal(match.size, BoardSize.SMALL);

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

        var snapshot = modelFactory.createStartSnapshot(BoardSize.SMALL);

        assert.ok(snapshot);
        assert.equal(snapshot.board.length, 49); // 7*7 fields

        assert.equal(snapshot.getField(0, 0).figure.type, PieceType.MAN);
        assert.equal(snapshot.getField(1, 0).figure.type, PieceType.KNIGHT);
        assert.equal(snapshot.getField(2, 0).figure.type, PieceType.WOMAN);
        assert.equal(snapshot.getField(3, 0).figure.type, PieceType.ZENITH);
        assert.equal(snapshot.getField(4, 0).figure.type, PieceType.WOMAN);
        assert.equal(snapshot.getField(5, 0).figure.type, PieceType.KNIGHT);
        assert.equal(snapshot.getField(6, 0).figure.type, PieceType.MAN);


        assert.equal(snapshot.getField(0, 6).figure.type, PieceType.MAN);
        assert.equal(snapshot.getField(1, 6).figure.type, PieceType.KNIGHT);
        assert.equal(snapshot.getField(2, 6).figure.type, PieceType.WOMAN);
        assert.equal(snapshot.getField(3, 6).figure.type, PieceType.ZENITH);
        assert.equal(snapshot.getField(4, 6).figure.type, PieceType.WOMAN);
        assert.equal(snapshot.getField(5, 6).figure.type, PieceType.KNIGHT);
        assert.equal(snapshot.getField(6, 6).figure.type, PieceType.MAN);

        // check the rocks and colors
        for (var i = 0; i < 7; i++) {
            assert.equal(snapshot.getField(i, 1).figure.type, PieceType.ROCKS);
            assert.equal(snapshot.getField(i, 5).figure.type, PieceType.ROCKS);

            assert.equal(snapshot.getField(i, 0).figure.color, Color.WHITE);
            assert.equal(snapshot.getField(i, 6).figure.color, Color.BLACK);

            assert.equal(snapshot.getField(i, 0).figure.color, Color.WHITE);
            assert.equal(snapshot.getField(i, 6).figure.color, Color.BLACK);
        }


        // check that the zenith is in the center field
//        assert.equal(snapshot.getField(3,3).figure.type, PieceType.ZENITH);


    });

    it("should create a valid empty big board snapshot", function () {

        var snapshot = modelFactory.createStartSnapshot(BoardSize.BIG);
        assert.ok(snapshot);

        assert.equal(snapshot.board.length, 81); // 9*9 fields

        assert.equal(snapshot.getField(0, 0).figure.type, PieceType.MAN);
        assert.equal(snapshot.getField(1, 0).figure.type, PieceType.KNIGHT);
        assert.equal(snapshot.getField(2, 0).figure.type, PieceType.WOMAN);
        assert.equal(snapshot.getField(3, 0).figure.type, PieceType.KNOWLEDGE)
        assert.equal(snapshot.getField(4, 0).figure.type, PieceType.ZENITH);
        assert.equal(snapshot.getField(5, 0).figure.type, PieceType.FAITH);
        assert.equal(snapshot.getField(6, 0).figure.type, PieceType.WOMAN);
        assert.equal(snapshot.getField(7, 0).figure.type, PieceType.KNIGHT);
        assert.equal(snapshot.getField(8, 0).figure.type, PieceType.MAN);

        assert.equal(snapshot.getField(0, 8).figure.type, PieceType.MAN);
        assert.equal(snapshot.getField(1, 8).figure.type, PieceType.KNIGHT);
        assert.equal(snapshot.getField(2, 8).figure.type, PieceType.WOMAN);
        assert.equal(snapshot.getField(3, 8).figure.type, PieceType.KNOWLEDGE)
        assert.equal(snapshot.getField(4, 8).figure.type, PieceType.ZENITH);
        assert.equal(snapshot.getField(5, 8).figure.type, PieceType.FAITH);
        assert.equal(snapshot.getField(6, 8).figure.type, PieceType.WOMAN);
        assert.equal(snapshot.getField(7, 8).figure.type, PieceType.KNIGHT);
        assert.equal(snapshot.getField(8, 8).figure.type, PieceType.MAN);

        for (var i = 0; i < 9; i++) {
            assert.equal(snapshot.getField(i, 1).figure.type, PieceType.ROCKS);
            assert.equal(snapshot.getField(i, 7).figure.type, PieceType.ROCKS);

            assert.equal(snapshot.getField(i, 0).figure.color, Color.WHITE);
            assert.equal(snapshot.getField(i, 8).figure.color, Color.BLACK);

            assert.equal(snapshot.getField(i, 0).figure.color, Color.WHITE);
            assert.equal(snapshot.getField(i, 8).figure.color, Color.BLACK);
        }

        // check that the zenith is in the center field
//        assert.equal(snapshot.getField(4,4).figure.type, PieceType.ZENITH);

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