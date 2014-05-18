/**
 * Created by Erik Jähne on 15.05.2014.
 */


var mongodb = require('./mongodb');
var modelFactory = require('../model/model-factory');
var assert = require("chai").assert;

describe.skip("mongodb", function(){
    describe("create Match",function(){
       it("should create a match in the datbase",function(){
           var match = modelFactory.createMatch(9);
           var persistedMatch = mongodb.create(match);


           assert.ok(persistedMatch);
           assert.ok(persistedMatch.matchId);

           var getMatch = mongodb.get(persistedMatch.matchId);

           assert.ok(getMatch);
           assert.equal(JSON.stringify(persistedMatch),JSON.stringify(getMatch));

       });
    });
});