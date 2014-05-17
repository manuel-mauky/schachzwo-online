"use strict";

var express = require("express");


var modelFactory = require("../model/model-factory.js");
var model = require("../model/model");
var matchStore = require("../store/match-store.js");
var GameLogic = require("../logic/gamelogic");
var BoardAccessor = require('../logic/board-accessor');

var uuid = require("node-uuid");

var route = express.Router();

var PLAYER_COOKIE_NAME = 'player_id';
var HTTP_AUTHORIZATION_METHOD = "PLAYER_ID";

route.get("/:id", function (req, res) {

    var match = matchStore.get(req.params.id);
    if (!match) {
        return matchError404(req, res);
    }

    if (match.playerBlack) {
        delete match.playerBlack.playerId;
    }
    if (match.playerWhite) {
        delete match.playerWhite.playerId;
    }

    delete match.history;
    return res.json(match);
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

    try {

        var match = matchStore.create(modelFactory.createMatch(req.body.size));

        res.statusCode = 201;
        res.header('Location', req.url + match.matchId);
        delete match.history;
        return res.json(match);

    } catch (error) {
        res.statusCode = 400;
        return res.json(error);
    }


});

route.get("/:id/self", function (req, res) {

    var match = matchStore.get(req.params.id);
    if (!match) {
        return matchError404(req, res);
    }

    var playerId = findPlayerId(req);
    if (checkAccess(match, playerId)) {
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

route.get("/:id/opponent", function (req, res) {

    var match = matchStore.get(req.params.id);
    if (!match) {
        return matchError404(req, res);
    }

    var playerId = findPlayerId(req);
    if (checkAccess(match, playerId)) {
        return matchError401(req, res);
    }

    var player;

    if (playerId == match.playerWhite.playerId) {
        player = new model.Player(match.playerBlack);
        player.color = model.Color.BLACK;
        delete player.playerId;
    } else {
        player = new model.Player(match.playerWhite);
        player.color = model.Color.WHITE
        delete player.playerId;
    }
    return res.json(player);

});


route.post("/:id/login", function (req, res) {

    var match = matchStore.get(req.params.id);
    if (!match) {
        return matchError404(req, res);
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

        if (matchStore.update(match)) {

            player.color = (player.playerId == match.playerBlack.playerId
                ? model.Color.BLACK :
                model.Color.WHITE);

            res.cookie(PLAYER_COOKIE_NAME, player.playerId);
            res.json(player);
            return res;

        } else {
            res.statusCode = 500;
            return res.json(
                {
                    name: 'Login failed',
                    message: 'Internal Server Error'
                });
        }

    } else {
        res.statusCode = 409;
        return res.json(
            {
                name: 'Login failed',
                message: 'No more free places.'
            });
    }
});

route.get("/:id/board", function (req, res) {

    var match = matchStore.get(req.params.id);
    if (match) {
        return  res.json(match.getCurrentSnapshot());
    } else {
        return matchError404(req, res);
    }


});

route.get("/:id/moves", function (req, res) {

    var match = matchStore.get(req.params.id);
    if (match) {
        return  res.json(match.history);
    } else {
        return matchError404(req, res);
    }

});

route.post("/:id/moves", function (req, res) {

    var match = matchStore.get(req.params.id);
    if (!match) {
        return matchError404(req, res);
    }

    var playerId = findPlayerId(req);
    if (checkAccess(match, playerId)) {
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

    var gl = new GameLogic(match);

    if (gl.isValidMove(playerId, move)) {
        match.addMove(move);
        matchStore.update(match);
        res.statusCode = 201;
        return res.json(move);
    } else {
        return moveFailed(res, 'Move can not be applied because the move is invalid.');
    }


});

route.get("/:id/threats", function (req, res) {

    var match = matchStore.get(req.params.id);
    if (match) {
        return res.json(new BoardAccessor(match).getThreats());
    } else {
        return matchError404(req, res);
    }

});

route.get("/:id/valid-moves", function (req, res) {

    var match = matchStore.get(req.params.id);
    if (match) {
        return res.json(new BoardAccessor(match).getValidMoves());
    } else {
        return matchError404(req, res);
    }

});

//TODO GET /matches/:matchId/draw
//TODO PUT /matches/:matchId/draw

/**
 * Returns the playerId (if any) from the given request.
 *
 * There are several ways to define a playerId in a request, f.e. in a cookie.
 *
 * If a playerId was found in the given request it will be returned. Otherwise
 * nothing/undefined will be returned.
 *
 * @param req
 * @returns {*}
 */
var findPlayerId = function (req) {

    var playerId = req.cookies[PLAYER_COOKIE_NAME];
    if (!playerId) {
        var header = req.header('Authorization');
        if (header) {
            var value = header.split(/\s+/);
            var id = value.pop();
            if (HTTP_AUTHORIZATION_METHOD === value.pop()) {
                playerId = id;
            }
        }
    }

    return playerId;
};

var checkAccess = function (match, playerId) {
    return !playerId || (playerId != match.playerBlack.playerId && playerId != match.playerWhite.playerId);
};


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

//Export route
module.exports.route = route;

//Export constants
module.exports.PLAYER_COOKIE_NAME = PLAYER_COOKIE_NAME;
module.exports.HTTP_AUTHORIZATION_METHOD = HTTP_AUTHORIZATION_METHOD;



