
/**
 * Created by Erik Jähne on 15.05.2014.
 */

var Mongodb = require('./mongodb');
var modelFactory = require('../model/model-factory');
var assert = require("chai").assert;

describe("storeProvider", function(){

    var store = new Mongodb();
    var match = modelFactory.createMatch(9);
    var persistedMatch;

    it("should support CRUD functionality",function(done){
        // Create Match Test
        persistedMatch = store.createMatch(match,function(err){
            assert.notOk(err);

            //Get Match Test
            store.getMatch(persistedMatch.matchId,function(err,match){
                try{ //mocha has problems with getting assert errors in async calls, so we must pass it manually
                    assert.notOk(err);
                    assert.ok(match);

                    //Delete Match test
                    store.deleteMatch(persistedMatch.matchId,function(err){
                        assert.notOk(err);
                        done();
                    });
                }catch(e){done(e);}
            });
        });
        assert.ok(persistedMatch);
        assert.ok(persistedMatch.matchId);
        //check valid UUID v4
        assert.isTrue(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/.test(persistedMatch.matchId));
    });
});