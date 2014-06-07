"use strict";

var express = require("express");
var app = express();

var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

app.use(bodyParser());
app.use(cookieParser());

var noCacheFilter =  function(req, res, next) {
    res.header('Pragma', 'no-cache');
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.header('Expires', 'Thu, 01 Jan 1970 00:00:00');
    next();
};

app.use("/matches", noCacheFilter);
app.use("/matches", require("./server/routes/matches").route);

app.use("/match", noCacheFilter);
app.use("/match", require("./server/routes/incoming-link").route);

app.use(express.static(__dirname + "/client"));

app.get("*", function(req, res){
    // respond with html page
    if (req.accepts('html')) {
        return res.status(404).redirect('/index.html#/404');
    }
    // respond with json
    if (req.accepts('json')) {
        return res.status(404).send({ error: 'Not found' });
    }
    return res.status(404).send('Not found');
});


var server = app.listen(1337, function() {
    console.log("Listening on port %d", server.address().port);
});

module.exports.app = app;

