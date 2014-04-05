var express = require("express");

var route = express.Router();

route.get("/", function(req, res, next){
    "use strict";

    res.send("hello world");
});


module.exports.route = route;
