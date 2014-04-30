"use strict";

var request = require('supertest');
var express = require("express");
var assert = require("chai").assert;

var model = require("../model/model");

var app = require('../../app').app;

describe.skip('Mock REST API test /match', function () {

        describe('GET /match/{matchId}', function () {

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

        describe('PUT /match/{matchId}', function (){

            it("should change playerBlack's name as playerBlack", function(done){

                var match = {size : 7, playerBlack : {name : "Player 1"}};

                request(app)
                    .put('/match/123', match)
                    .expect(200)
                    .expect(function(res){
                        assert.isDefined(res.body.playerWhite);
                        assert.isDefined(res.body.playerBlack);
                        assert.isDefined(res.body.playerBlack.playerId);
                        assert.isDefined(res.body.matchId);
                        assert.isDefined(res.body.state);
                        assert.isDefined(res.body.size);
                        assert.isUndefined(res.body.history);
                        assert.equal(res.body.playerBlack.name, "Player 1","Players name should be changed.")
                    })
                    .end(done);


            });

        });

        describe('GET /match/{matchId}/board', function(){

            it("should return actual board snapshot", function(done){

                request(app)
                    .get('/match/123/board')
                    .expect(200)
                    .expect(function(res){
                        assert.isArray(res.body);
                    })
                    .end(done);

            });

        });

        describe('GET /match/{matchId}/move', function(){

            it("should return done moves", function(done){

                request(app)
                    .get('/match/123/board')
                    .expect(200)
                    .expect(function(res){
                        assert.isArray(res.body);
                    })
                    .end(done);

            });


        });

        describe('POST /match/{matchId}/move', function(){

           it("should add a new move", function(done){

               var move = {figure: {color: model.Color.BLACK, type: model.FigureType.ROCKS},
                           from: {column : 2, row: 1},
                           to: {column: 2, row: 2}};

               request(app)
                   .post('/match/123/move', move)
                   .expect(201)
                   .expect(function(res){
                        assert.isDefined(res.body);
                   })
                   .end(done);
           });

            it("should not add invalid move", function(done){

                var move = {figure: {color: model.Color.BLACK, type: model.FigureType.ROCKS},
                    from: {column : 2, row: 2},
                    to: {column: 3, row: 2}};

                request(app)
                    .post('/match/123/move', move)
                    .expect(400, done);
            });

        });


        describe('GET /match/{matchId}/valid-moves', function(){

            it("should return all valid moves", function(done){

                request(app)
                    .get('/match/123/valid-moves')
                    .expect(200)
                    .expect(function(res){
                        assert.isArray(res.body);
                    })
                    .end(done);
            });

        });

});