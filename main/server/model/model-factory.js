"use strict"

var model = require("./model");

var Color = require("./color");
var PieceType = require("../model/piece-type");

var BoardSize = require("../model/boardsize");
var State = require("./state");


/**
 * Create a match instance with the given size.
 * @param size
 */
module.exports.createMatch = function (size) {
    if (size == BoardSize.SMALL) {
        return createSmallMatch();
    } else if (size == BoardSize.BIG) {
        return createBigMatch();
    } else {
        throw new Error("The size param was wrong. Size needs to be either 7 (small) or 9 (big)");
    }
};

module.exports.createEmptyMatch = function(size) {
    if(size == BoardSize.SMALL){
        return helper_createEmptyMatch(BoardSize.SMALL);
    }else if(size == BoardSize.BIG){
        return helper_createEmptyMatch(BoardSize.BIG);
    }else{
        throw new Error("The size param was wrong. Size needs to be either 7 (small) or 9 (big)");
    }

};


/**
 * Create a snapshot with the start lineup.
 * @param size
 */
module.exports.createStartSnapshot = function (size) {
    if (size == BoardSize.SMALL) {
        return createSmallStartSnapshot();
    } else if (size == BoardSize.BIG) {
        return createBigStartSnapshot();
    } else {
        throw new Error("The size param was wrong. Size needs to be either 7 (small) or 9 (big)");
    }
};


module.exports.createEmptySnapshot = function(size){

    if( size != BoardSize.SMALL && size != BoardSize.BIG ){
        throw new Error("The size param was wrong. Size needs to be either 7 (small) or 9 (big)");
    }

    var start = new model.Snapshot({});
    helper_fillWithEmptyFields(start.board, size);

    return start;
};

var createSmallMatch = function () {
    var match = helper_createEmptyMatch(BoardSize.SMALL);
    return match;
};

var createBigMatch = function () {
    var match = helper_createEmptyMatch(BoardSize.BIG);
    return match;
};

var helper_createEmptyMatch = function(size){
    var match = new model.Match({});

    match.size = size;
    match.state = State.PREPARING;

    return match;
};




var createSmallStartSnapshot = function () {
    var start = new model.Snapshot({});

    helper_fillWithEmptyFields(start.board, 7);

    helper_fillWithSpecialFigures(start, Color.WHITE, 0, 7);
    helper_fillWithSpecialFigures(start, Color.BLACK, 6, 7);
    start.getField(3, 0).figure = new model.Figure({color: Color.WHITE, type: PieceType.ZENITH});
    start.getField(3, 6).figure = new model.Figure({color: Color.BLACK, type: PieceType.ZENITH});

    helper_fillWithRocks(start, 7);


    return start;
};

var createBigStartSnapshot = function () {
    var start = new model.Snapshot({});

    helper_fillWithEmptyFields(start.board, 9);

    helper_fillWithSpecialFigures(start, Color.WHITE, 0, 9);
    start.getField(3, 0).figure = new model.Figure({color: Color.WHITE, type: PieceType.KNOWLEDGE});
    start.getField(4, 0).figure = new model.Figure({color: Color.WHITE, type: PieceType.ZENITH});
    start.getField(5, 0).figure = new model.Figure({color: Color.WHITE, type: PieceType.FAITH});


    helper_fillWithSpecialFigures(start, Color.BLACK, 8, 9);
    start.getField(3, 8).figure = new model.Figure({color: Color.BLACK, type: PieceType.KNOWLEDGE});
    start.getField(4, 8).figure = new model.Figure({color: Color.BLACK, type: PieceType.ZENITH});
    start.getField(5, 8).figure = new model.Figure({color: Color.BLACK, type: PieceType.FAITH});


    helper_fillWithRocks(start, 9);

    return start;
};


/**
 * Fills the given board (array of Fields) with empty field instances.
 */
var helper_fillWithEmptyFields = function (board, size) {
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            board.push(new model.Field({position:{column: i, row: j}}));
        }
    }
};

/**
 * This helper is used to place the figures man, woman and knight on the given row.
 * With the size param this function can be reused for big and small boards.
 */
// todo: Implement the start position with two zeniths on the origin.
var helper_fillWithSpecialFigures = function (board, color, row, size) {
    board.getField(0, row).figure = new model.Figure({color: color, type: PieceType.MAN});
    board.getField(1, row).figure = new model.Figure({color: color, type: PieceType.KNIGHT});
    board.getField(2, row).figure = new model.Figure({color: color, type: PieceType.WOMAN});

    board.getField(size - 3, row).figure = new model.Figure({color: color, type: PieceType.WOMAN});
    board.getField(size - 2, row).figure = new model.Figure({color: color, type: PieceType.KNIGHT});
    board.getField(size - 1, row).figure = new model.Figure({color: color, type: PieceType.MAN});
};

var helper_fillWithRocks = function (board, size) {
    for (var i = 0; i < size; i++) {
        board.getField(i, 1).figure = new model.Figure({color: Color.WHITE, type: PieceType.ROCKS});
        board.getField(i, size - 2).figure = new model.Figure({color: Color.BLACK, type: PieceType.ROCKS});
    }
};


