"use strict";

var request = require('supertest');
var express = require("express");

var app = require('../../app').app;

describe('GET /match', function () {

    it("should be 200", function (done) {

        request(app)
            .get('/match/123')
            .expect(200, done);
    });

});