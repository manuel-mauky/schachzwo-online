"use strict";

var express = require("express");

var route = express.Router();

route.all("/", function(req, res){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.redirect('/index.html#/404');
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});



module.exports.route = route;