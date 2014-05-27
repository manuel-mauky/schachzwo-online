"use strict";

var express = require("express");


var modelFactory = require("../model/model-factory.js");
var model = require("../model/model");

var storeProvider = require("../store/store-provider");
var sse = require("../messaging/sse");
var message = require('../messaging/message');
var GameLogic = require("../logic/gamelogic").GameLogic;
var CheckType = require("../logic/gamelogic").CheckType;
var BoardAccessor = require('../logic/board-accessor');

var restUtils = require("./rest-utils");

var uuid = require("node-uuid");

var route = express.Router();

var PLAYER_COOKIE_NAME = 'player_id';
var HTTP_AUTHORIZATION_METHOD = "PLAYER_ID";

route.get("/:id", function (req, res) {
    var store = storeProvider.getStore();

    store.getMatch(req.params.id, function (err, match) {
        if (err || !match) {
            return matchError404(req, res);
        }

        if (req.headers.accept == 'text/event-stream') {
            var playerId = restUtils.findPlayerId(req);
            return sse.initClient(req, res, match.matchId, playerId);
        } else {


            if (match.playerBlack) {
                delete match.playerBlack.playerId;
            }
            if (match.playerWhite) {
                delete match.playerWhite.playerId;
            }

            delete match.history;
            return res.json(match);
        }
    });
});


route.get("/:id/event-stream", function (req, res) {
    var store = storeProvider.getStore();

    store.getMatch(req.params.id, function (err, match) {
        if (err || !match) {
            return matchError404(req, res);
        }
        var playerId = restUtils.findPlayerId(req);
        return sse.initClient(req, res, match.matchId, playerId);
    });
});


route.post("/", function (req, res) {

    if (!req.body || !req.body.size) {
        res.statusCode = 400;
        return res.json(
            {
                name: 'Match can not be created',
                message: 'Match can not be created because the request is invalid.'
            });
    }

    var store = storeProvider.getStore();

    try {

        store.createMatch(modelFactory.createMatch(req.body.size), function (err, match) {
            if (err) {
                res.statusCode = 400;
                return res.json(err);
            }

            res.statusCode = 201;
            res.header('Location', req.url + match.matchId);
            delete match.history;
            return res.json(match);
        });

    } catch (err) {
        res.statusCode = 400;
        return res.json(err);
    }

});

route.get("/:id/self", function (req, res) {
    var store = storeProvider.getStore();

    store.getMatch(req.params.id, function (err, match) {
        if (err || !match) {
            return matchError404(req, res);
        }

        var playerId = restUtils.findPlayerId(req);
        var gameLogic = new GameLogic(match);
        if (!gameLogic.isPlayerParticipating(playerId)) {
            return matchError401(req, res);
        }

        var player;

        if (playerId == match.playerBlack.playerId) {
            player = new model.Player(match.playerBlack);
            player.color = model.Color.BLACK;
        } else {
            player = new model.Player(match.playerWhite);
            player.color = model.Color.WHITE
        }
        return res.json(player);
    });

});

route.get("/:id/opponent", function (req, res) {
    var store = storeProvider.getStore();

    store.getMatch(req.params.id, function (err, match) {

        if (err || !match) {
            return matchError404(req, res);
        }

        var gameLogic = new GameLogic(match);

        var playerId = restUtils.findPlayerId(req);
        if (!gameLogic.isPlayerParticipating(playerId)) {
            return matchError401(req, res);
        }

        var player;

        if (playerId == match.playerWhite.playerId) {
            player = new model.Player(match.playerBlack);
            player.color = model.Color.BLACK;
            delete player.playerId;
        } else {
            player = new model.Player(match.playerWhite);
            player.color = model.Color.WHITE;
            delete player.playerId;
        }
        return res.json(player);
    });
});


route.post("/:id/login", function (req, res) {
    var store = storeProvider.getStore();
    store.getMatch(req.params.id, function (err, match) {
        if (err || !match) {
            return matchError404(req, res);
        }

        if (match.isMatchFullyOccupied()) {
            res.statusCode = 409;
            return res.json(
                {
                    name: 'Login failed',
                    message: 'No more free places.'
                });
        }

        var name;
        if (req.body) {
            if (req.body.name) {
                name = req.body.name;
            } else {
                res.statusCode = 400;
                return res.json(
                    {
                        name: "Bad login request",
                        message: "No 'name' attribute in body found"
                    }
                );
            }
        }


        var player = new model.Player({playerId: uuid.v4(), name: name});
        var successfullyAdded = match.addPlayer(player);

        if (successfullyAdded) {

            store.updateMatch(match, function (err, updatedMatch) {
                if (err || !updatedMatch) {
                    res.statusCode = 500;
                    return res.json(
                        {
                            name: 'Login failed',
                            message: 'Internal Server Error'
                        });
                }

                player.color = (player.playerId == match.playerBlack.playerId
                    ? model.Color.BLACK :
                    model.Color.WHITE);

                res.cookie(PLAYER_COOKIE_NAME, player.playerId);


                if (match.isMatchFullyOccupied()) {
                    sse.sendMessage(message.MATCH_STARTED, match.matchId);
                }


                return res.json(player);
            });

        } else {
            res.statusCode = 409;
            return res.json(
                {
                    name: 'Login failed',
                    message: 'No more free places.'
                });
        }

    });
});

route.get("/:id/board", function (req, res) {
    var store = storeProvider.getStore();
    store.getMatch(req.params.id, function (err, match) {
        if (err || !match) {
            return matchError404(req, res);
        }

        return  res.json(match.getCurrentSnapshot().board);
    });
});

route.get("/:id/moves", function (req, res) {
    var store = storeProvider.getStore();
    store.getMatch(req.params.id, function (err, match) {
        if (err || !match) {
            return matchError404(req, res);
        }

        return  res.json(match.history);
    });
});

route.post("/:id/moves", function (req, res) {
    var store = storeProvider.getStore();
    store.getMatch(req.params.id, function (err, match) {

        if (err || !match) {
            return matchError404(req, res);
        }


        var playerId = restUtils.findPlayerId(req);
        var gameLogic = new GameLogic(match);

        if (!gameLogic.isPlayerParticipating(playerId)) {
            return matchError401(req, res);
        }

        var moveFailed = function (res, message) {
            res.statusCode = 400;
            return res.json({
                name: "Move failed",
                message: message
            });
        };

        var move;

        try {
            move = new model.Move(req.body);
        } catch (error) {
            return moveFailed(res, 'Move can not be applied because the request is invalid.');
        }

        if (new GameLogic(match).isValidMove(playerId, move)) {
            match.addMove(move);
            store.updateMatch(match, function (err, match) {
                if (err || !match) {
                    return moveFailed(res, 'Move can not be applied because the move is invalid.');
                }
                sendMoveMessages(match);
                res.statusCode = 201;
                return res.json(move);
            });

        } else {
            return moveFailed(res, 'Move can not be applied because the move is invalid.');
        }

    });

});

route.get("/:id/threats", function (req, res) {
    var store = storeProvider.getStore();
    store.getMatch(req.params.id, function (err, match) {
        if (err || !match) {
            return matchError404(req, res);
        }

        return res.json(new BoardAccessor(match).getThreats());
    });
});

route.get("/:id/valid-moves", function (req, res) {
    var store = storeProvider.getStore();
    store.getMatch(req.params.id, function (err, match) {
        if (err || !match) {
            return matchError404(req, res);
        }

        return res.json(new BoardAccessor(match).getValidMoves());
    });
});

//TODO GET /matches/:matchId/draw
//TODO PUT /matches/:matchId/draw


var matchError404 = function (req, res) {
    res.statusCode = 404;
    return res.json(
        {
            name: 'Match not found',
            message: 'Match with the given ID ' + req.params.id + ' does not exist.'
        });
};

var matchError401 = function (req, res) {

    res.statusCode = 401;
    return res.json(
        {
            name: 'Unauthorized',
            message: 'You are not logged into this match.'
        });

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

        if (checkType == CheckType.CHECK_FINISH) {
            sse.sendMessage(message.HAS_WON_BY_CHECK_TARGET, match.matchId, self.playerId);
            sse.sendMessage(message.HAS_LOST_BY_CHECK_TARGET, match.matchId, opponent.playerId);
        }

        if (checkType == CheckType.CHECK_FINISH_BOTH) {
            sse.sendMessage(message.HAS_WON_BY_CHECK_TARGET, match.matchId, self.playerId);
            sse.sendMessage(message.HAS_LOST_BY_CHECK_TARGET, match.matchId, opponent.playerId);
        }
    };

    sse.sendMessage(message.UPDATE, match.matchId);
    sendMessages('white');
    sendMessages('black');
};


//Export route
module.exports.route = route;

//Export constants
module.exports.PLAYER_COOKIE_NAME = PLAYER_COOKIE_NAME;
module.exports.HTTP_AUTHORIZATION_METHOD = HTTP_AUTHORIZATION_METHOD;



