"use strict";

var express = require("express");

var modelFactory = require("../model/model.factory");
var model = require("../model/model");

var route = express.Router();

route.get("/:id", function (req, res) {

    //TODO match must be loaded from persistence layer

    if (req.params.id != 123) {
        res.statusCode = 404;
        return res.json(
            {
                name: 'Match not found',
                message: 'Match with the given ID ' + req.params.id + ' does not exist.'
            });
    }

    var match = modelFactory.createMatch(model.BoardSize.SMALL);
    match.matchId = req.params.id;
    //TODO history must be deleted

    res.json(match);
});


route.post("/", function (req, res) {

    if (!req.body) {
        res.statusCode = 400;
        return res.json(
            {
                name: 'Match can not be created',
                message: 'Match can not be created because the request is invalid.'
            });
    }

    try {
        var match = new model.Match(req.body);
        match.matchId = '12345'; //TODO needs to be persisted
    } catch (error) {
        res.statusCode = 400;
        return res.json(error);
    }

    res.statusCode = 201;
    res.header('Location', req.url + match.matchId);
    res.json(match);

});


route.put("/:id", function (req, res) {

    // TODO security

    if (!req.body) {
        res.statusCode = 400;
        return res.json(
            {
                name: 'Match can not be updated',
                message: 'Match can not be updated because the request is invalid.'
            });
    }

    var match = req.body.match;
    //TODO needs to be persisted

    res.statusCode = 200;
    res.json(match);
});


module.exports.route = route;


