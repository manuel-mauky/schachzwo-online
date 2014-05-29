/**
 * The purpose of this component is to control the flow of one match.
 * It is a kind of facade for the rest services that composes the different steps that are needed for
 * specific game actions.
 */

"use strict";


var storeProvider = require("../store/store-provider");
var sse = require("../messaging/sse");
var message = require('../messaging/message');

var BoardAccessor = require('../logic/board-accessor');

var GameLogic = require("../logic/gamelogic").GameLogic;
var CheckType = require("../logic/gamelogic").CheckType;

var modelFactory = require("../model/model-factory.js");
var model = require("../model/model");


var uuid = require("node-uuid");


module.exports.getMatchById = function(id,  callbacks){
    var store = storeProvider.getStore();

    store.getMatch(id, function(err, match){
        if(err || !match){
            callWhenDefined(callbacks.onMatchNotFound);
            return;
        }

        if(match.playerBlack){
            delete match.playerBlack.playerId;
        }

        if(match.playerWhite){
            delete match.playerWhite.playerId;
        }

        delete match.history;

        callWhenDefined(callbacks.onSuccess, match);
    });

};

module.exports.createMatch = function(size, callbacks){
    var store = storeProvider.getStore();
    try{
        store.createMatch(modelFactory.createMatch(size), function(err, match){
            if(err){
                callWhenDefined(callbacks.onError, err);
            }

            delete match.history;

            callWhenDefined(callbacks.onSuccess, match);
        });
    } catch(err){
        callWhenDefined(callbacks.onError, err);
    }
};

module.exports.getPlayer = function(matchId, playerId, isOpponent, callbacks){
    var store = storeProvider.getStore();

    store.getMatch(matchId, function(err, match){
       if(err || !match){
           callWhenDefined(callbacks.onMatchNotFound);
           return;
       }

        var gameLogic = new GameLogic(match);

        if(!gameLogic.isPlayerParticipating(playerId)){
            callWhenDefined(callbacks.onPlayerNotFound);
            return;
        }

        var player;

        if(isOpponent){

            if(playerId == match.playerWhite.playerId){
                player = new model.Player(match.playerBlack);
                player.color = model.Color.BLACK;
            } else {
                player = new model.Player(match.playerWhite);
                player.color = model.Color.WHITE;
            }
            delete player.playerId;
        }else{
            if(playerId == match.playerBlack.playerId){
                player = new model.Player(match.playerBlack);
                player.color = model.Color.BLACK;
            } else {
                player = new model.Player(match.playerWhite);
                player.color = model.Color.WHITE;
            }
        }

        callWhenDefined(callbacks.onSuccess, player);
    });
};

module.exports.login = function(id, name, callbacks){

    var store = storeProvider.getStore();
    store.getMatch(id, function(err, match){
        if(err || !match){
            callWhenDefined(callbacks.onMatchNotFound);
            return;
        }


        if(match.isMatchFullyOccupied()){
            callWhenDefined(callbacks.onLoginFailed, "No more free places.");
            return;
        }

        var player = new model.Player({playerId: uuid.v4(), name: name});
        var successfullyAdded = match.addPlayer(player);

        if (successfullyAdded) {
            store.updateMatch(match, function (err, updatedMatch) {
                if(err || !updatedMatch){
                    callWhenDefined(callbacks.onError);
                    return;
                }

                player.color = (player.playerId == match.playerBlack.playerId
                    ? model.Color.BLACK :
                    model.Color.WHITE);

                if (match.isMatchFullyOccupied()) {
                    sse.sendMessage(message.MATCH_STARTED, match.matchId);
                }

                callWhenDefined(callbacks.onSuccess, player);
            });
        }else{
            callWhenDefined(callbacks.onLoginFailed, "No more free places.");
        }
    });
};

module.exports.getBoard = function(matchId, callbacks){
    var store = storeProvider.getStore();
    store.getMatch(matchId, function (err, match) {
        if(err || !match){
            callWhenDefined(callbacks.onMatchNotFound);
            return;
        }

        callWhenDefined(callbacks.onSuccess,match.getCurrentSnapshot().board);
    });
};


module.exports.getMoves = function(matchId, callbacks){
    var store = storeProvider.getStore();
    store.getMatch(matchId, function (err, match) {
        if (err || !match) {
            callWhenDefined(callbacks.onMatchNotFound);
            return;
        }

        callWhenDefined(callbacks.onSuccess,match.history);
    });
};

module.exports.addMove = function(matchId, playerId, moveJson, callbacks){
    var store = storeProvider.getStore();
    store.getMatch(matchId, function (err, match) {
        if (err || !match) {
            callWhenDefined(callbacks.onMatchNotFound);
            return;
        }

        var gameLogic = new GameLogic(match);

        if(!gameLogic.isPlayerParticipating(playerId)){
            callWhenDefined(callbacks.onPlayerNotFound);
        }

        var move;

        try{
            move = new model.Move(moveJson);
        }catch(error){
            callWhenDefined(callbacks.onMoveFailed,'Move can not be applied because the request is invalid.');
        }

        if(new GameLogic(match).isValidMove(playerId, move)){
            match.addMove(move);

            store.updateMatch(match, function(err, match){
                if(err || !match){
                    callWhenDefined(callbacks.onMoveFailed,'Move can not be applied because the move is invalid.');
                    return;
                }

                sendMoveMessages(match);

                callWhenDefined(callbacks.onSuccess, match.history);
            });
        }else{
            callWhenDefined(callbacks.onMoveFailed,'Move can not be applied because the move is invalid.');
        }
    });
};


module.exports.getThreats = function(matchId, callbacks){
    var store = storeProvider.getStore();
    store.getMatch(matchId, function (err, match) {
        if(err || !match){
            callWhenDefined(callbacks.onMatchNotFound);
            return;
        }

        callWhenDefined(callbacks.onSuccess,new BoardAccessor(match).getThreats());
    });
};

module.exports.getValidMoves = function(matchId, callbacks){
    var store = storeProvider.getStore();
    store.getMatch(matchId, function (err, match) {
        if (err || !match) {
            callWhenDefined(callbacks.onMatchNotFound);
            return;
        }

        callWhenDefined(callbacks.onSuccess,new BoardAccessor(match).getValidMoves());
    });
};


module.exports.getCapturedPieces = function(matchId, callbacks) {

    var store = storeProvider.getStore();
    store.getMatch(matchId, function (err, match) {
        if (err || !match) {
            callWhenDefined(callbacks.onMatchNotFound);
            return;
        }

        callWhenDefined(callbacks.onSuccess,new BoardAccessor(match).getCapturedPieces());
    });

};


var callWhenDefined = function(callback){
    var args = Array.prototype.slice.call(arguments,1);
    if(callback){
        callback.apply(null, args);
    }
};



var sendMoveMessages = function(match) {

    var gameLogic = new GameLogic(match);

    var sendMessages = function(color) {

        var checkType = gameLogic.getCheckType(color);
        var self = color == model.Color.WHITE ? match.playerWhite : match.playerBlack;
        var opponent = color == model.Color.WHITE ? match.playerBlack : match.playerWhite;

        if (checkType == CheckType.CHECK) {
            sse.sendMessage(message.IS_IN_CHECK, match.matchId, self.playerId);
        }

        if (checkType == CheckType.CHECK_MATE) {
            sse.sendMessage(message.HAS_WON_BY_CHECK_MATE, match.matchId, self.playerId);
            sse.sendMessage(message.HAS_LOST_BY_CHECK_MATE, match.matchId, opponent.playerId);
        }

        if (checkType == CheckType.CHECK_TARGET) {
            sse.sendMessage(message.HAS_WON_BY_CHECK_TARGET, match.matchId, self.playerId);
            sse.sendMessage(message.HAS_LOST_BY_CHECK_TARGET, match.matchId, opponent.playerId);
        }

        if (checkType == CheckType.CHECK_TARGET_BOTH) {
            sse.sendMessage(message.HAS_WON_BY_CHECK_TARGET, match.matchId, self.playerId);
            sse.sendMessage(message.HAS_LOST_BY_CHECK_TARGET, match.matchId, opponent.playerId);
        }
    };

    sse.sendMessage(message.UPDATE, match.matchId);
    sendMessages('white');
    sendMessages('black');
};
