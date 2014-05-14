"use strict";

var express = require("express");

var route = express.Router();


route.get("/:matchId", function (req, res) {

    console.log("matchID:" + req.params.matchId);

    return res.json(req.params.matchId);
});


route.get("/", function (req, res) {
    return res.status(404).send("404");
});

module.exports.route = route;