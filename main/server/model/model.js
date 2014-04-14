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

    this.figure = json.figure || undefined;

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

    this.playerWhite = json.playerWhite;
    this.playerBlack = json.playerBlack;

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
