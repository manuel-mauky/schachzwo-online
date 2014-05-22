
/**
 * Created by Erik Jähne on 15.05.2014.
 */

"use strict";

var Mongodb = require('./mongodb');
var modelFactory = require('../model/model-factory');
var assert = require("chai").assert;

describe("mongodb", function(){

    var store = new Mongodb();
    var match = modelFactory.createMatch(9);
    var persistedMatch;

    it("should support CRUD functionality",function(done){
        // Create Match Test
        store.createMatch(match,function(err, persistedMatch){
            assert.notOk(err);
            assert.ok(persistedMatch);
            assert.ok(persistedMatch.matchId);
            var matchId = persistedMatch.matchId;

            //Get Match Test
            store.getMatch(matchId,function(err,loadedMatch){
                try{ //mocha has problems with getting assert errors in async calls, so we must pass it manually
                    assert.notOk(err);
                    assert.ok(loadedMatch);

                    //Delete Match test
                    store.deleteMatch(matchId,function(err){
                        assert.notOk(err);


                        store.getMatch(matchId, function(err, match){
                            assert.notOk(err);
                            assert.isNull(match);
                            done();
                        });
                    });
                }catch(e){done(e);}
            });
        });
    });

    it("createMatch should return an error when no valid match is passed", function(done){
        store.createMatch(false, function(err, match){
            assert.ok(err);
            assert.notOk(match);

            done();
        });
    })
});