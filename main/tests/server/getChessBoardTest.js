
var request = require("request");
var assert = require("chai").assert;
require("mocha");


describe("GET /board", function() {
    "use strict";

    var url = "http://localhost:1337/board";

    var options = {};

    it("should be hello world", function(done){

        request.get(url, options, function(err, response, body){
            assert.ok(response, "response should be ok");
            assert.ok(body, "body should be ok");

            assert.equal(response.statusCode, 200);
            assert.equal(body, "hello world");

            done();
        });
    });
});

