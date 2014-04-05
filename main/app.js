var express = require("express");
var app = express();


app.use("/board", require("./server/board").route);

app.use(express.static(__dirname + "/client"));


var server = app.listen(1337, function() {
    "use strict";

    console.log("Listening on port %d", server.address().port);
});