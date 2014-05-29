"use strict";

var express = require("express");

var matchController = require("../logic/match-controller");

var storeProvider = require("../store/store-provider");
var sse = require("../messaging/sse");
var message = require('../messaging/message');

var restUtils = require("./rest-utils");

var route = express.Router();

var PLAYER_COOKIE_NAME = 'player_id';
var HTTP_AUTHORIZATION_METHOD = "PLAYER_ID";

route.get("/:id", function (req, res) {

    if (req.headers.accept == 'text/event-stream') {
        registerSSE(req, res);
        return;
    }

    matchController.getMatchById(req.params.id, {
        onSuccess: function (match) {
            return res.json(match);
        },

        onMatchNotFound: function () {
            matchError404(req, res);
        }
    });
});


route.get("/:id/event-stream", function (req, res) {
    registerSSE(req, res);
});

var registerSSE = function (req, res) {
    var store = storeProvider.getStore();

    store.getMatch(req.params.id, function (err, match) {
        if (err || !match) {
            return matchError404(req, res);
        }
        var playerId = restUtils.findPlayerId(req);
        return sse.initClient(req, res, match.matchId, playerId);
    });
};


route.post("/", function (req, res) {

    if (!req.body || !req.body.size) {
        res.statusCode = 400;
        return res.json(
            {
                name: 'Match can not be created',
                message: 'Match can not be created because the request is invalid.'
            });
    }

    matchController.createMatch(req.body.size, {
        onSuccess: function (match) {
            res.statusCode = 201;
            res.header("Location", req.url + match.matchId);
            return res.json(match);
        },
        onError: function (err) {
            res.statusCode = 400;
            return res.json(err);
        }
    });

});

route.get("/:id/self", function (req, res) {

    var playerId = restUtils.findPlayerId(req);

    matchController.getPlayer(req.params.id, playerId, false, {
        onSuccess: function (player) {
            res.json(player);
        },

        onMatchNotFound: function () {
            matchError404(req, res);
        },

        onPlayerNotFound: function () {
            matchError401(req, res);
        }
    });
});

route.get("/:id/opponent", function (req, res) {
    var playerId = restUtils.findPlayerId(req);

    matchController.getPlayer(req.params.id, playerId, true, {
        onSuccess: function (player) {
            res.json(player);
        },

        onMatchNotFound: function () {
            matchError404(req, res);
        },

        onPlayerNotFound: function () {
            matchError401(req, res);
        }
    });
});


route.post("/:id/login", function (req, res) {

    var name;
    if (req.body && req.body.name) {
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

    matchController.login(req.params.id, name,
        {
            onSuccess: function (player) {
                res.cookie(PLAYER_COOKIE_NAME, player.playerId);

                res.json(player);
            },

            onLoginFailed: function (message) {
                res.statusCode = 409;
                res.json(
                    {
                        name: 'Login failed',
                        message: message
                    });
            },

            onMatchNotFound: function () {
                matchError404(req, res);
            },

            onError: function () {
                res.statusCode = 500;
                res.json(
                    {
                        name: 'Login failed',
                        message: 'Internal Server Error'
                    });
            }
        });
});

route.get("/:id/board", function (req, res) {
    matchController.getBoard(req.params.id, {
        onSuccess: function (board) {
            return res.json(board);
        },
        onMatchNotFound: function () {
            matchError404(req, res);
        }
    });
});

route.get("/:id/moves", function (req, res) {
    matchController.getMoves(req.params.id, {
        onSuccess: function (history) {
            return res.json(history);
        },
        onMatchNotFound: function () {
            matchError404(req, res);
        }
    });
});

route.post("/:id/moves", function (req, res) {

    var playerId = restUtils.findPlayerId(req);
    matchController.addMove(req.params.id, playerId, req.body, {
        onSuccess: function (move) {
            res.statusCode = 201;
            return res.json(move);
        },

        onMatchNotFound: function () {
            matchError404(req, res);
        },

        onPlayerNotFound: function () {
            matchError401(req, res);
        },

        onMoveFailed: function (message) {
            res.statusCode = 400;
            return res.json({
                name: "Move failed",
                message: message
            });
        }

    });
});

route.get("/:id/threats", function (req, res) {
    matchController.getThreats(req.params.id, {
        onSuccess: function (threats) {
            res.json(threats);
        },

        onMatchNotFound: function () {
            matchError404(req, res);
        }
    });
});

route.get("/:id/valid-moves", function (req, res) {
    matchController.getValidMoves(req.params.id, {
        onSuccess: function (validMoves) {
            res.json(validMoves);
        },

        onMatchNotFound: function () {
            matchError404(req, res);
        }
    });
});

//TODO PUT /matches/:matchId/draw

route.put("/:id/draw", function (req, res) {


    var playerId = restUtils.findPlayerId(req);
    matchController.createDraw(req.params.id, playerId, req.body, {
        onSuccess: function (draw) {
            res.statusCode = 201;
            res.json(draw);
        },

        onNotAuthorized: function () {
            matchError401(req, res);
        },

        onMatchNotFound: function () {
            matchError404(req, res);
        },

        onError: function () {
            res.statusCode = 400;
            return res.json("Bad Request");
        },

        onDrawInvalid: function () {
            res.statusCode = 403;
            res.json("The draw request was invalid");
        }
    });
});


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



