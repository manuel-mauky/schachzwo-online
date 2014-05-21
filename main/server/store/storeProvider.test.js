
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
        var persistedMatch;

        it("should create a match in the datbase",function(){
            persistedMatch = store.createMatch(match,function(err){
                assert.notOk(err);
            });
            assert.ok(persistedMatch);
            assert.ok(persistedMatch.matchId);
            //check valid UUID v4
            assert.isTrue(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/.test(persistedMatch.matchId));
        });

        it("should get the right match from the datbase",function(done){
            store.getMatch(persistedMatch.matchId,function(err,match){
                try{ //mocha has problems with getting assert errors in async calls, so we must pass it manually
                    assert.notOk(err);
                    assert.ok(match);
                    done();
                }catch(e){done(e);}
            });
        });
        it("should delete the match from the database",function(done){
            store.deleteMatch(persistedMatch.matchId,function(err){
                assert.notOk(err);
                done();
            });
        });
    });
});