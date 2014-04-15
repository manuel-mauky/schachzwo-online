"use strict"


/**
 * The size that the board can have.
 *
 * @type {{SMALL: number, BIG: number}}
 */
var BoardSize = {
    SMALL: 7,
    BIG: 9
}

/**
 * The possible color of a figure.
 *
 * @type {{BLACK: string, WHITE: string}}
 */
var Color = {
    BLACK: "black",
    WHITE: "white"
}

/**
 * The types of figures that are possible.
 *
 * @type {{ROCKS: string, MAN: string, WOMAN: string, KNIGHT: string, KNOWLEDGE: string, FAITH: string, ZENITH: string}}
 */
var FigureType = {
    ROCKS: "rocks",
    MAN: "man",
    WOMAN: "woman",
    KNIGHT: "knight",
    KNOWLEDGE: "knowledge",
    FAITH: "faith",
    ZENITH: "zenith"
}

/**
 * The states that the match can have.
 *
 * @type {{READY: string, PAUSE: string, FINISHED: string, PLAYING: string}}
 */
var State = {
    READY: "ready",
    PAUSE: "pause",
    FINISHED: "finished",
    PLAYING: "playing"
}

/**
 * The Figure constructor. This the figures of the game.
 * Every figure is defined by its color and type (see
 *
 *
 * @param json a json representation of the figure.
 * @returns {Figure}
 * @constructor
 */
var Figure = function (json) {
    var json = json || 0;

    this.color = json.color;
    this.type = json.type;

    return this;
}

/**
 * The Field constructor. This represents a single field of the chess board.
 * A field is defined by its column (column) and row (row) on the board.
 * Every field can have zero or one figure on it.
 *
 * @param json
 * @returns {Field}
 * @constructor
 */
var Field = function (json) {
    var json = json || 0;

    if (json.figure) {
        this.figure = new Figure(json.figure);
    } else {
        this.figure = undefined;
    }

    this.column = json.column;
    this.row = json.row;

    return this;
}

/**
 * The Snapshot constructor. This represents a single point in time of the match.
 *
 *
 * @param json
 * @returns {Snapshot}
 * @constructor
 */
var Snapshot = function (json) {

    var json = json || 0;

    this.board = new Array();
    if (Array.isArray(json.board)) {
        // for every json-entry create a field instance.
        json.board.forEach(function (entry) {
            this.board.push(new Field(entry));
        }, this);
    }

    /**
     * @param column
     * @param row
     * @returns the field or undefined if no field with this coordinates could be found.
     */
    this.getField = function (column, row) {
        for (var i = 0; i < this.board.length; i++) {
            var field = this.board[i];
            if (field.column == column && field.row == row) {
                return field;
            }
        }
        return undefined;
    };


    /**
     * This method can be used for debugging. It prints the current board
     * with console.log.
     */
    this.debugPrint = function () {

        if (this.board.length == 49) {
            var size = 7;
        } else if (this.board.length == 81) {
            var size = 9;
        } else {
            return;
        }

        for (var i = 0; i < size; i++) {
            var s = "";
            for (var j = 0; j < size; j++) {
                var field = this.getField(j, i);

                if (field.figure) {
                    switch (field.figure.type) {
                        case FigureType.ROCKS:
                            s += "r ";
                            break;
                        case FigureType.MAN:
                            s += "m ";
                            break;
                        case FigureType.WOMAN:
                            s += "w ";
                            break;
                        case FigureType.KNIGHT:
                            s += "s ";
                            break;
                        case FigureType.KNOWLEDGE:
                            s += "k ";
                            break;
                        case FigureType.FAITH:
                            s += "f ";
                            break;
                        case FigureType.ZENITH:
                            s += "z ";
                            break;
                    }
                } else {
                    s += "  ";
                }
            }
            console.log(s);
        }
    };

    return this;
}

/**
 * The player constructor.
 *
 * @param json
 * @returns {Player}
 * @constructor
 */
var Player = function (json) {
    var json = json || 0;

    this.playerId = json.playerId;
    this.name = json.name;

    return this;
}

/**
 * The match constructor. A match represents the whole game with
 * all data that is needed to describe the match incl. the history of the match.
 *
 * @param json
 * @returns {Match}
 * @constructor
 */
var Match = function (json) {
    var json = json || 0;

    this.playerWhite = new Player(json.playerWhite);
    this.playerBlack = new Player(json.playerBlack);

    this.matchId = json.matchId;
    this.state = json.state || State.READY;

    this.history = new Array();
    // for every json-entry create a snapshot instance.
    if (Array.isArray(json.history)) {
        json.history.forEach(function (entry) {
            this.history.push(new Snapshot(entry));
        }, this);
    }

    this.size = json.size || BoardSize.SMALL;


    /**
     * Returns the current snapshot of this match.
     */
    this.getCurrentSnapshot = function(){

        if(!this.history || this.history.length === 0){
            throw new Error("There is no current snapshot in the history.");
        }

        return this.history[this.history.length -1];
    }

    return this;
}


module.exports.BoardSize = BoardSize;
module.exports.Color = Color;
module.exports.FigureType = FigureType;
module.exports.State = State;
module.exports.Figure = Figure;
module.exports.Field = Field;
module.exports.Snapshot = Snapshot;
module.exports.Player = Player;
module.exports.Match = Match;
