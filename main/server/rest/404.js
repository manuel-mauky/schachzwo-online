"use strict";

var express = require("express");

var route = express.Router();

route.all("/", function(req, res){
   return res.status(404).send("404");
});

module.exports.route = route;