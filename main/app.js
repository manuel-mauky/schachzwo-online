var express = require("express");


var app = express();

app.get("/", function(req, res){
    "use strict";

    res.send("Hello World");
});

var server = app.listen(1337, function() {
    "use strict";

    console.log("Listening on port %d", server.address().port);
});