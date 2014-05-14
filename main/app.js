"use strict";

var express = require("express");
var app = express();

var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

app.use(bodyParser());
app.use(cookieParser());

app.use("/matches", require("./server/rest/matches").route);

app.use("/match", require("./server/rest/incoming-link").route);

app.use(express.static(__dirname + "/client"));

app.use("*", require("./server/rest/404").route);


var server = app.listen(1337, function() {
    console.log("Listening on port %d", server.address().port);
});

module.exports.app = app;

