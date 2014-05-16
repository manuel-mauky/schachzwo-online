"use strict";

var express = require("express");

var route = express.Router();

var matchStore = require("../store/match-store.js");

route.get("/:matchId", function (req, res) {

    var matchId = req.params.matchId;

    console.log("matchID:" + matchId);

    if(!matchId){
        return res.status(404).send("Match not found");
    }

    var match = matchStore.get(matchId);

    if(!match){
        return res.status(404).send("Match not found");
    }

    if(match.isMatchFullyOccupied()){
        console.log("zuschauer");
        // todo redirect zur Zuschauerseite
        return res.redirect("/");
    }else{
        console.log("login");
        // todo redirect zur Anmeldeseite
        return res.redirect("/#/match/" + matchId + "/login");
    }

});


route.get("/", function (req, res) {
    return res.status(404).send("404");
});

module.exports.route = route;