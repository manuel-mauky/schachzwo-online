"use strict";


var assert = require("assert");

/**
 * The size that the board can have.
 *
 * @type {{SMALL: number, BIG: number}}
 */
var BoardSize = {
    SMALL: 7,
    BIG: 9
};

/**
 * The possible color of a figure.
 *
 * @type {{BLACK: string, WHITE: string}}
 */
var Color = {
    BLACK: "black",
    WHITE: "white"
};

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
};

/**
 * The states that the match can have.
 *
 * @type {{PREPARING: string, PAUSE: string, FINISHED: string, PLAYING: string}}
 */
var State = {
    PREPARING: "preparing",
    FINISHED: "finished",
    PLAYING: "playing"
};

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
    assert.ok(json);
    assert.ok(json.color);
    assert.ok(json.type);

    this.color = json.color;
    this.type = json.type;

    return this;
};

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
    assert.ok(json);
    assert.ok(json.position);

    if (json.figure) {
        this.figure = new Figure(json.figure);
    }

    this.position = new Position(json.position);

    return this;
};

/**
 * The Position Constructor. This represents a Position on the Board
 * @param json
 * @return {Position}
 * @constructor
 */
var Position = function(json){
    assert.ok(json);
    assert.equal(typeof json.column, "number");
    assert.equal(typeof json.row, "number");

    this.column = json.column;
    this.row = json.row;
    return this;
};

/**
 * The Move constructor. This represents a Move on the Board in the History
 * @param json
 * @return {Move}
 * @constructor
 */
var Move = function(json){
    assert.ok(json);
    assert.ok(json.figure);
    assert.ok(json.from);
    assert.ok(json.to);

    this.figure = new Figure(json.figure);
    this.from = new Position(json.from);
    this.to = new Position(json.to);


    if(json.capturedFigure){
        this.capturedFigure = new Figure(json.capturedFigure);
    }


    return this;
};

var Draw = function (json) {
    assert.ok(json);
    assert.ok(json.color);
    assert.ok(json.type);

    this.color = json.color;
    this.type = json.type;

    return this;
};
Draw.Types = {
    Offered: 1,
    Accepted: 2,
    Rejected: 3
};

/**
 * The Snapshot constructor. This represents a single point in time of the match.
 *
 *
 * @param json
 * @returns {Snapshot}
 * @constructor
 */
var Snapshot = function (json) {
    var json = json || {};

    this.board = [];
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
};

/**
 * The player constructor.
 *
 * @param json
 * @returns {Player}
 * @constructor
 */
var Player = function (json) {
    assert.ok(json);
    assert.ok(json.playerId);
    assert.ok(json.name);

    this.playerId = json.playerId;
    this.name = json.name;

    return this;
};

/**
 * The match constructor. A match represents the whole game with
 * all data that is needed to describe the match incl. the history of the match.
 *
 * @param json
 * @returns {Match}
 * @constructor
 */
var Match = function (json) {
    var json = json || {};

    if(json.playerWhite){
        this.playerWhite = new Player(json.playerWhite);
    }
    if(json.playerBlack){
        this.playerBlack = new Player(json.playerBlack);
    }

    var currentSnapshot;
    this.matchId = json.matchId;
    this.state = json.state || State.PREPARING;

    this.history = [];

    // for every json-entry create a move instance.
    if (Array.isArray(json.history)) {
        json.history.forEach(function (entry) {
            if (entry.type && entry.color) {
                this.history.push(new Draw(entry));
            } else if (entry.figure && entry.from && entry.to) {
                this.history.push(new Move(entry));
            }
        }, this);
    }

    if(json.size == BoardSize.BIG){
        this.size = BoardSize.BIG;
    }else{
        this.size = BoardSize.SMALL;
    }

    /**
     * return the Color of the active Player who is on turn
     * @returns the Color of the active Player
     */
    this.getColorOfActivePlayer = function(){
        if(this.history.length % 2 == 0){
            return Color.BLACK;
        }
        else return Color.WHITE;
    };

    /**
     * Generate a Snapshot up to the given History entry
     * @param number
     * @returns {*}
     */
    this.generateSnapshot = function(number){
        if(!this.history || this.history.length < number ){
            throw new Error("There is no move in the history for this number.");
        }
        var modelFactory = require("./model-factory.js"); // required here to prevent recursive import as model.factory has a dependency to this model.js

        //for performace reasons maybe as static json -> evaluation
        var snapshot = modelFactory.createStartSnapshot(this.size);

        for(var i = 0; i < number; i++){
            var move = this.history[i];
            if(move.from && move.to){
                var fieldFrom = snapshot.getFieldFromPosition(move.from);
                var fieldTo = snapshot.getFieldFromPosition(move.to);
                fieldTo.figure = move.figure;
                fieldFrom.figure = undefined;
            }
        }
        return snapshot;
    };

    /**
     * This Method perform a Pop of the History and revert the last move in the currentSnapshot
     */
    this.historyPop = function() {
        currentSnapshot = this.getCurrentSnapshot();
        var i = this.history.length - 1;
        //ignore DRAW Elements
        while (!(this.history[i].from && this.history[i].to)) {
            i--;
        }
        var move = this.history[i];
        if (move.from && move.to) {
            var fieldFrom = currentSnapshot.getFieldFromPosition(move.from);
            var fieldTo = currentSnapshot.getFieldFromPosition(move.to);
            fieldFrom.figure = fieldTo.figure;
            fieldTo.figure = move.capturedFigure;
        }
        this.history.splice(i,1);
    };

    /**
     * This Method perform a Push with a move to the history and apply it on the currentSnapshot
     * @param move
     */
    this.historyPush = function(move){
         if(move.from && move.to){
            currentSnapshot = this.getCurrentSnapshot();
             var fieldFrom = currentSnapshot.getFieldFromPosition(move.from);
             var fieldTo = currentSnapshot.getFieldFromPosition(move.to);
             move.capturedFigure = fieldTo.figure;
             fieldTo.figure = move.figure;
             fieldFrom.figure = undefined;
         }
         this.history.push(move);
    };

    /**
     * Returns the current snapshot of this match.
     */
    this.getCurrentSnapshot = function(){
        if(!currentSnapshot) currentSnapshot = this.generateSnapshot(this.history.length);
        return currentSnapshot;
    };

    /**
     * Ermittelt ob ein Rocks durch eine Figur eingetauscht wurde
     */
    this.rocksPromotion = function(move) {
        var fieldFrom = this.getCurrentSnapshot().getFieldFromPosition(move.from);
        if (fieldFrom.figure.type == FigureType.ROCKS) {
            if (move.figure.color == Color.BLACK) {
                if (move.from.row == 1 && move.to.row == 0) {
                    return true;
                }
            } else {
                if (move.from.row == this.size - 2 && move.to.row == this.size - 1) {
                    return true;
                }
            }
            return false;
        }
    };

    this.addMove = function(move){

        if(! (move instanceof Move)){
            try{
                move = new Move(move);
            } catch(err){
                return false;
            }
        }

        //Doppelte Implementierung wie "isValidMove"
        var fieldFrom = this.getCurrentSnapshot().getFieldFromPosition(move.from);
        var fieldTo = this.getCurrentSnapshot().getFieldFromPosition(move.to);
        if(JSON.stringify(fieldFrom.figure) != JSON.stringify(move.figure)){
            if(!this.rocksPromotion(move)) {
              return false;
            }
        }
        var BoardAccessor = require("../logic/board-accessor");
        var accessor = new BoardAccessor(this);
        var fields = accessor.getRangeFor(move.from.column,move.from.row);
        var valid = false;
        fields.forEach(function(element){
            if(element.column == move.to.column && element.row == move.to.row) valid = true;
        });
        if(!valid){
          return false;
        }
        this.historyPush(move);
        return true;
    };

    //TODO besserer Name!
    this.addMove2 = function(fromCol, fromRow, toCol, toRow){
        var field = this.getCurrentSnapshot().getField(fromCol, fromRow);
        var figure = field.figure;

        if(figure){
            var move = new Move({
                figure: figure,
                from: {column: fromCol, row: fromRow},
                to: {column: toCol, row: toRow}
            });
            return this.addMove(move);
        }else{
            return false;
        }
    };

    this.addMoveFromPosition = function(position1,position2){
        return this.addMove2(position1.column,position1.row,position2.column,position2.row);
    };

    /**
     * This method is used to offer a draw. The draw is offered by the active player.
     *
     * A {@link Draw} instance will be created and added to the history of this match.
     * A draw can only be offered when there is no offered draw in the last turn.
     *
     * This method returns the draw instance when the draw was successfully added.
     * Otherwise <code>undefined</code> will be returned.
     */
    this.offerDraw = function () {
        if (this.history.length > 0) {
            var lastHistoryEntry = this.history[this.history.length - 1];

            if (lastHistoryEntry.type == Draw.Types.Offered) {
                return undefined;
            }
        }


        var draw = new Draw({
            color: this.getColorOfActivePlayer(),
            type: Draw.Types.Offered});

        this.historyPush(draw);
        return draw;
    };

    /**
     * This method is used to reject an offered draw. The rejection is done by the active player.
     *
     * You can only reject a draw when there was a draw offered in the previous turn.
     * When the draw was successfully rejected this method returns the draw instance.
     * When the draw couldn't be rejected (f.e. when there was no draw offered before) this method
     * returns <code>undefined</code>
     */
    this.rejectDraw = function () {
        if (this.history.length > 0) {
            var lastHistoryEntry = this.history[this.history.length - 1];

            if (lastHistoryEntry.type == Draw.Types.Offered) {
                var draw = new Draw({
                    color: this.getColorOfActivePlayer(),
                    type: Draw.Types.Rejected});

                this.historyPush(draw);
                return draw;
            }
        }

        return undefined;
    };

    /**
     * This method is used to accept an offered draw. The acception is done by the active player.
     *
     * You can only accept a draw when there was a draw offered in the previous turn.
     * When the draw was successfully accepted this method returns the draw instance.
     * When the draw couldn't be accepted (f.e. when there was no draw offered before) this method
     * returns <code>undefined</code>
     */
    this.acceptDraw = function () {
        if (this.history.length > 0) {
            var lastHistoryEntry = this.history[this.history.length - 1];

            if (lastHistoryEntry.type == Draw.Types.Offered) {
                var draw = new Draw({
                    color: this.getColorOfActivePlayer(),
                    type: Draw.Types.Accepted});

                this.historyPush(draw);
                return draw;
            }
        }

        return undefined;
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
     * If all players are added, then the match state changes from <code>State.PREPARING</code> to <code>State.PLAYING</code>.
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

            if (State.PREPARING == this.state) {
                this.state = State.PLAYING;
            }
            return true;
        }

        return false;
    };

    this.historyContainsMoveToPositionWithFigureType = function(column,row,figureType){
        var contains = false;
        this.history.forEach(function(move){
            if(move.to && move.to.column == column && move.to.row == row && move.figure.type == figureType){
                contains = true;
                return;
            }
        });
        return contains;
    };

    /**
     * returns <code>true</code> when both player are set in the game.
     * otherwise <code>false</code>
     */
    this.isMatchFullyOccupied = function(){
      return (this.playerBlack && this.playerWhite);
    };

    /**
     * Returns <code>true</code> when the player with the given id is the black player of this match,
     * otherwise <code>false</code>
     * @param playerId
     */
    this.isBlackPlayer = function(playerId) {
        return this.getBlackPlayerId() == playerId;
    };

    /**
     * Returns <code>true</code> when the player with the given id is the white player of this match,
     * otherwise <code>false</code>
     * @param playerId
     */
    this.isWhitePlayer = function(playerId) {
        return this.getWhitePlayerId() == playerId;
    };

    /**
     * returns <code>true</code> when the player with the given id is the active player,
     * otherwise <code>false</code>
     *
     * @param playerId
     * @returns {boolean}
     */
    this.isPlayersTurn = function(playerId){
        var colorOfPlayer;
        if(this.isBlackPlayer(playerId)){
            colorOfPlayer = Color.BLACK;
        } else if(this.isWhitePlayer(playerId)) {
            colorOfPlayer = Color.WHITE;
        }

        return this.getColorOfActivePlayer() == colorOfPlayer;
    };


    /**
     * returns the playerId of the opponent relative to the given playerId.
     * @param playerId
     * @returns {*}
     */
    this.getOpponentPlayerId = function(playerId){
        if(this.isBlackPlayer(playerId)){
            return this.getWhitePlayerId();
        }else if(this.isWhitePlayer(playerId)){
            return this.getBlackPlayerId();
        }

        return undefined;
    };

    /**
     * If there is a black player currently participating this method returns its playerId.
     * When no black player is participating this method returns <code>undefined</code>.
     *
     */
    this.getBlackPlayerId = function(){
        if(this.playerBlack){
            return this.playerBlack.playerId;
        }
        return undefined;
    };

    /**
     * If there is a white player currently participating this method returns its playerId.
     * When no white player is participating this method returns <code>undefined</code>.
     *
     */
    this.getWhitePlayerId = function(){
        if(this.playerWhite){
            return this.playerWhite.playerId;
        }
        return undefined;
    };

    return this;
};


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
module.exports.Draw = Draw;
