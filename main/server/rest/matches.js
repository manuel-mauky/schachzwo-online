"use strict";

var express = require("express");

var modelFactory = require("../model/model.factory");
var model = require("../model/model");
var matchStore = require("../store/match.store.js");

var uuid = require("node-uuid");

var route = express.Router();

var PLAYER_COOKIE_NAME = 'player_id';
var HTTP_AUTHORRIZATION_METHOD = "PLAYER_ID";

route.get("/:id", function (req, res) {

    var match = matchStore.get(req.params.id);
    if (!match) {
        return match404(req, res);
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


route.post("/:id/login", function (req, res) {

    var match = matchStore.get(req.params.id);
    if (match) {
        match = new model.Match(match);
    } else {
        return match404(req, res);
    }

    var name;
    if (req.body) {
        if(req.body.name){
            name = req.body.name;
        }else{
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

            player['color'] = player.playerId === match.playerBlack.playerId ? model.Color.BLACK : model.Color.WHITE;

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
        match = new model.Match(match);
        return  res.json(match.getCurrentSnapshot());
    } else {
        return match404(req, res);
    }


});

route.get("/:id/moves", function (req, res) {

    var match = matchStore.get(req.params.id);
    if (match) {
        match = new model.Match(match);
        return  res.json(match.history);
    } else {
        return match404(req, res);
    }

});

route.post("/:id/moves", function (req, res) {

    var match = matchStore.get(req.params.id);
    if (!match) {
        return match404(req, res);
    }

    var playerId = authenticate(req);

    if (!playerId) {
        res.statusCode = 401;
        return res.json(
            {
                name: 'Unauthorized',
                message: 'You are not logged into this game.'
            });
    }

    if (!req.body) {
        res.statusCode = 400;
        return res.json(
            {
                name: 'Move failed',
                message: 'Move can not be applied because the request is invalid.'
            });
    }

    var move = req.body;

    //TODO Check whether it's his turn
    //TODO Link to game logic

    res.statusCode = 201;
    return res.json(move);
});

//TODO GET /matches/:matchId/draw
//TODO PUT /matches/:matchId/draw
//TODO GET /matches/:matchId/threats
//TODO GET /matches/:matchId/valid-moves


var authenticate = function (req) {

    var playerId = req.cookies[PLAYER_COOKIE_NAME];
    if (!playerId) {
        //TODO playerID read out from the authorization header
    }

    return playerId;
};


var match404 = function (req, res) {
    res.statusCode = 404;
    return res.json(
        {
            name: 'Match not found',
            message: 'Match with the given ID ' + req.params.id + ' does not exist.'
        });
};

//Export route
module.exports.route = route;

//Export constants
module.exports.PLAYER_COOKIE_NAME = PLAYER_COOKIE_NAME;



