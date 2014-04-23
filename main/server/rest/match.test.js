"use strict";

var request = require('supertest');
var express = require("express");
var assert = require("chai").assert;

var app = require('../../app').app;

describe.skip('REST API test /match', function () {

    describe('GET /match/{matchId} Mock', function () {

        it("should be 200", function (done) {

            request(app)
                .get('/match/123')
                .expect(200, done);
        });

        it("should be 404", function(done){
            request(app)
                .get('/match/124')
                .expect(404, done);
        });

        it("should have no history", function(done){
            request(app)
                .get('/match/123')
                .expect(function(res){
                    assert.isUndefined(res.body.history);
                })
                .end(done);
        });

        it("should have all required attributes", function(done){
            request(app)
                .get('/match/123')
                .expect(function(res){
                    assert.isDefined(res.body.playerWhite);
                    assert.isDefined(res.body.playerBlack);
                    assert.isDefined(res.body.matchId);
                    assert.isDefined(res.body.state);
                    assert.isDefined(res.body.size);
                })
                .end(done);
        });
    });

    describe('POST /match',function(){

        it("should return new match",function(done){

           var match = {size : 7};

           request(app)
               .post('/match', match)
               .expect(201)
               .expect('location','/12345')
               .expect(function(res){
                   assert.isDefined(res.body.playerWhite);
                   assert.isDefined(res.body.playerBlack);
                   assert.isDefined(res.body.matchId);
                   assert.isDefined(res.body.state);
                   assert.isDefined(res.body.size);
                   assert.isUndefined(res.body.history);
               })
               .end(done);
        });

        it("should not return new match",function(done){

            var match = {size : 5};

            request(app)
                .post('/match', match)
                .expect(400, done);

        });



    });



});