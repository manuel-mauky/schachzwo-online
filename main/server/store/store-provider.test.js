
"use strict";

var storeProvider = require("./store-provider");
var modelFactory = require('../model/model-factory');
var assert = require("chai").assert;

describe("store provider", function(){
    var match;
    var store;



    describe("mongodb", function(){
        beforeEach(function(){
            storeProvider.activeStoreType = storeProvider.StoreType.MONGODB;
            store = storeProvider.getStore();
            match = modelFactory.createMatch(9);
        });


        it("should support basic CRUD functionality", function(done){
            testCRUD(done);
        });
    });

    describe("inmemorydb", function(){
        beforeEach(function(){
            storeProvider.activeStoreType = storeProvider.StoreType.INMEMORY;
            store = storeProvider.getStore();
            match = modelFactory.createMatch(9);
        });

        it("should support basic CRUD functionality", function(done){
            testCRUD( done);
        });

    });

    var testCRUD = function( done){
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
    };


});