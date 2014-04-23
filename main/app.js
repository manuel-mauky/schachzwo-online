var express = require("express");
var app = express();

var bodyParser = require("body-parser");

app.use(bodyParser());

app.use("/match", require("./server/rest/match").route);

app.use(express.static(__dirname + "/client"));


var server = app.listen(1337, function() {
    "use strict";

    console.log("Listening on port %d", server.address().port);
});

module.exports.app = app;

