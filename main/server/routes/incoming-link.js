"use strict";

var express = require("express");

var restUtils = require("./rest-utils");

var route = express.Router();

var GameLogic = require("../logic/gamelogic").GameLogic;

var storeProvider = require("../store/store-provider");

route.get("/:matchId", function (req, res) {

    var matchId = req.params.matchId;

    if(!matchId){
        return res.status(404).send("Match not found");
    }

    var store = storeProvider.getStore();

    store.getMatch(matchId, function(err, match){
        if (err || !match) {
            return res.status(404).send("Match not found");
        }

        var playerId = restUtils.findPlayerId(req);

        var gameLogic = new GameLogic(match);

        if(gameLogic.isPlayerParticipating(playerId)){
            return res.redirect("/#/match/" + matchId);
        }


        if(match.isMatchFullyOccupied()){
            console.log("zuschauer");
            return res.redirect("/#/match/" + matchId);
        }else{
            console.log("login");
            return res.redirect("/#/match/" + matchId + "/login");
        }
    });

});


route.get("/", function (req, res) {
    return res.status(404).send("404");
});

module.exports.route = route;