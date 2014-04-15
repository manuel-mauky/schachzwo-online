"use strict"

var model = require("./model");

var Color = model.Color;
var FigureType = model.FigureType;

/**
 * Create a match instance with the given size.
 * @param size
 */
module.exports.createMatch = function (size) {
    if (size == model.BoardSize.SMALL) {
        return createSmallMatch();
    } else if (size == model.BoardSize.BIG) {
        return createBigMatch();
    } else {
        throw new Error("The size param was wrong. Size needs to be either 7 (small) or 9 (big)");
    }
}


/**
 * Create a snapshot with the start lineup.
 * @param size
 */
module.exports.createStartSnapshot = function (size) {
    if (size == model.BoardSize.SMALL) {
        return createSmallStartSnapshot();
    } else if (size == model.BoardSize.BIG) {
        return createBigStartSnapshot();
    } else {
        throw new Error("The size param was wrong. Size needs to be either 7 (small) or 9 (big)");
    }
}


var createSmallMatch = function () {
    var match = new model.Match();

    match.matchId = createMatchId();
    match.size = model.BoardSize.SMALL;
    match.state = model.State.READY;

    match.history.push(createSmallStartSnapshot());

    return match;
}

var createBigMatch = function () {
    var match = new model.Match();

    match.matchId = createMatchId();
    match.size = model.BoardSize.BIG;
    match.state = model.State.READY;

    match.history.push(createBigStartSnapshot());

    return match;
}


var createMatchId = function () {
    return 123; // needs to be replaces by GUID
}


var createSmallStartSnapshot = function () {
    var start = new model.Snapshot();

    helper_fillWithEmptyFields(start.board, 7);

    helper_fillWithSpecialFigures(start, Color.WHITE, 0, 7);
    helper_fillWithSpecialFigures(start, Color.BLACK, 6, 7);

    helper_fillWithRocks(start, 7);


    return start;
}

var createBigStartSnapshot = function () {
    var start = new model.Snapshot();

    helper_fillWithEmptyFields(start.board, 9);

    helper_fillWithSpecialFigures(start, Color.WHITE, 0, 9);
    start.getField(3, 0).figure = new model.Figure({color: Color.BLACK, type: FigureType.FAITH});
    start.getField(5, 0).figure = new model.Figure({color: Color.BLACK, type: FigureType.KNOWLEDGE});


    helper_fillWithSpecialFigures(start, Color.BLACK, 8, 9);
    start.getField(3, 8).figure = new model.Figure({color: Color.BLACK, type: FigureType.FAITH});
    start.getField(5, 8).figure = new model.Figure({color: Color.BLACK, type: FigureType.KNOWLEDGE});


    helper_fillWithRocks(start, 9);

    return start;
}


/**
 * Fills the given board (array of Fields) with empty field instances.
 */
var helper_fillWithEmptyFields = function (board, size) {
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            board.push(new model.Field({column: i, row: j}));
        }
    }
}

/**
 * This helper is used to place the figures man, woman and knight on the given row.
 * With the size param this function can be reused for big and small boards.
 */
var helper_fillWithSpecialFigures = function (board, color, row, size) {
    board.getField(0, row).figure = new model.Figure({color: color, type: FigureType.MAN});
    board.getField(1, row).figure = new model.Figure({color: color, type: FigureType.KNIGHT});
    board.getField(2, row).figure = new model.Figure({color: color, type: FigureType.WOMAN});
    board.getField(size - 3, row).figure = new model.Figure({color: color, type: FigureType.WOMAN});
    board.getField(size - 2, row).figure = new model.Figure({color: color, type: FigureType.KNIGHT});
    board.getField(size - 1, row).figure = new model.Figure({color: color, type: FigureType.MAN});
}

var helper_fillWithRocks = function (board, size) {
    for (var i = 0; i < size; i++) {
        board.getField(i, 1).figure = new model.Figure({color: Color.WHITE, type: FigureType.ROCKS});
        board.getField(i, size - 2).figure = new model.Figure({color: Color.BLACK, type: FigureType.ROCKS});
    }
}


