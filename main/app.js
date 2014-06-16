"use strict";

var express = require("express");
var app = express();

var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

var minimist = require("minimist") // CLI args parsing

var noCacheFilter =  function(req, res, next) {
    res.header('Pragma', 'no-cache');
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.header('Expires', 'Thu, 01 Jan 1970 00:00:00');
    next();
};

app.use(bodyParser());
app.use(cookieParser());

app.use(express.static(__dirname + "/client"));

app.use("/matches", noCacheFilter);
app.use("/matches", require("./server/routes/matches").route);

app.use("/", noCacheFilter);
app.use("/", require("./server/routes/incoming-link").route);

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


var args = minimist(process.argv.slice(2));

// node app.js --port 80
if(args.port){
    var port = args.port;
}else {
    var port = 1337;
}

var server = app.listen(port, function() {
    console.log("Listening on port %d", server.address().port);
});

module.exports.app = app;

