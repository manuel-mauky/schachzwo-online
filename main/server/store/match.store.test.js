/**
 * Created by Marlene on 13.05.2014.
 */

var matchStore = require('../store/match.store');
var model = require("../model/model");

var modelFactory = require("../model/model.factory");

var assert = require("chai").assert;

describe('store tests',function(){

    it("should support Create, Get and Update", function(){
        var match = modelFactory.createMatch(7);
        match.playerBlack = new model.Player({playerId: 1, name: "bob"});

        assert.notOk(match.matchId);

        var persistedMatch = matchStore.create(match);

        assert.ok(persistedMatch);
        assert.ok(persistedMatch.matchId);



        var loadedMatch = matchStore.get(persistedMatch.matchId);

        assert.ok(loadedMatch);

        assert.instanceOf(loadedMatch, model.Match);
        assert.equal(loadedMatch.matchId, persistedMatch.matchId);
        assert.deepEqual(loadedMatch.playerBlack, match.playerBlack);


        var allMatches = matchStore.getAll();

        assert.isArray(allMatches);
        assert.equal(allMatches.length, 1);



        loadedMatch.playerWhite = new model.Player({playerId: 2, name: "alice"});

        var successful = matchStore.update(loadedMatch);
        assert.isTrue(successful);

        assert.equal(matchStore.get(loadedMatch.matchId).playerWhite.name, "alice");

       });

    it('create should work with json Match', function(){
        var json = {size: 7, state: "playing"};

        var persistedMatch = matchStore.create(json);
        assert.ok(persistedMatch);
        assert.ok(persistedMatch.matchId);
    });

    it("create should work with Match instance", function(){
        var json = {size: 7, state: "playing"};
        var match = new model.Match(json);

        var persistedMatch = matchStore.create(match);
        assert.ok(persistedMatch);
        assert.ok(persistedMatch.matchId);
    })

});