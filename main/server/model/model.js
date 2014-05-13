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

    this.position = new Position(json.position);

    return this;
}

/**
 * The Position Constructor. This represents a Position on the Board
 * @param json
 * @return {Position}
 * @constructor
 */
var Position = function(json){
    var json = json || 0;

    this.column = json.column;
    this.row = json.row;
    return this;
}

/**
 * The Move constructor. This represents a Move on the Board in the History
 * @param json
 * @return {Move}
 * @constructor
 */
var Move = function(json){
    var json = json || 0;

    this.figure = new Figure(json.figure);
    this.from = new Position(json.from);
    this.to = new Position(json.to);
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
            if (field.position.column == column && field.position.row == row) {
                return field;
            }
        }
        return undefined;
    };

    this.getFieldFromPosition = function(position){
        return this.getField(position.column,position.row);
    }

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

        for (var row = 0; row < size; row++) {
            var s = "";
            for (var column = 0; column < size; column++) {
                var field = this.getField(column, row);

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
                    s += "[]";
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

    if(json.playerWhite){
        this.playerWhite = new Player(json.playerWhite);
    }
    if(json.playerBlack){
        this.playerBlack = new Player(json.playerBlack);
    }

    this.matchId = json.matchId;
    this.state = json.state || State.READY;

    this.history = [];
    // for every json-entry create a move instance.
    if (Array.isArray(json.history)) {
        json.history.forEach(function (entry) {
            this.history.push(new Move(entry));
        }, this);
    }

    if(json.size == BoardSize.BIG){
        this.size = BoardSize.BIG;
    }else{
        this.size = BoardSize.SMALL;
    }

    /**
     * Generate a Snapshot up to the given History entry
     * @param number
     * @returns {*}
     */
    this.generateSnapshot = function(number){
        if(!this.history || this.history.length < number ){
            throw new Error("There is no move in the history for this number.");
        }
        var modelFactory = require("./model.factory"); // required here to prevent recursive import as model.factory has a dependency to this model.js

        //for performace reasons maybe as static json -> evaluation
        var snapshot = modelFactory.createStartSnapshot(this.size);

        for(var i = 0; i < number; i++){
            var move = this.history[i];
            var fieldFrom = snapshot.getFieldFromPosition(move.from);
            var fieldTo = snapshot.getFieldFromPosition(move.to);
            if(JSON.stringify(fieldFrom.figure) != JSON.stringify(move.figure)) throw new Error("This Move from" + JSON.stringify(move.from) + " to " + JSON.stringify(move.to) + " with figure " + JSON.stringify(move.figure) + " was invalid!");//todo testen
            fieldTo.figure = fieldFrom.figure;
            fieldFrom.figure = undefined;
        }
        return snapshot;
    }

    /**
     * Returns the current snapshot of this match.
     */
    this.getCurrentSnapshot = function(){
        return this.generateSnapshot(this.history.length);
    }

    this.addMove = function(move){
        //todo error handling
        //figur auf schachbrett vorhanden
        //zielfeld gültig -> validator
        this.history.push(move);
    };

    /**
     * Adds new player to the match.
     *
     * The param can either be a JSON representation of the player or an instance
     * of the Player class.
     *
     * When the match has no player yet, the first player added by this function will become the "black" player.
     *
     * The second one will become "white".
     *
     * Any player that is added after that (meaning that black and white are already set) won't be added
     * to the game. This method will return <code>false</code> in this case.
     *
     * @param player the player that should be added, either as Player instance or JSON
     * @returns {boolean} <code>true</code> when a player was successfully added, otherwise <code>false</code>
     */
    this.addPlayer = function(player){

        if(! (player instanceof Player)){
            player = new Player(player);
        }

        if(!this.playerBlack){
            this.playerBlack = player;
            return true;
        }else if(!this.playerWhite){
            this.playerWhite = player;
            return true;
        }

        return false;

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
module.exports.Position = Position;
module.exports.Move = Move;
