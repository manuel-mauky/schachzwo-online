
/**
 * Created by Erik Jähne on 15.05.2014.
 */


var storeProvider = require('./storeProvider');
var StoreType = require('./storeProvider').StoreType;
var modelFactory = require('../model/model-factory');
var assert = require("chai").assert;

describe("storeProvider", function(){
    describe("create Match",function(){

        var store = new storeProvider(StoreType.MONGODB);
        var match = modelFactory.createMatch(9);

        store.createMatch(match,function(err,persistedMatch){
            it("should create a match in the datbase",function(){
                assert.ok(persistedMatch);
                assert.ok(persistedMatch.matchId);
            });
/*
            store.getMatch(persistedMatch.matchId,function(err,match){
                console.error(err);
                console.error(match);
                it("should get the right match from the datbase",function(){
                    assert.ok(match);
                    assert.equal(JSON.stringify(persistedMatch),JSON.stringify(match));
                });

                store.deleteMatch(persistedMatch.matchId,function(err){
                    it("should delete the match from the database",function(){
                        assert.notOk(err);
                    });
                });
            });*/
        });
    });
});