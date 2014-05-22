"use strict";

var model = require("../model/model");

// Store as a simple data structure in memory
var store = {};


/**
 * Returns a match with a given ID. If the requested match does not exist, undefined is returned.
 *
 * @param {String} id the ID of the match
 * @returns {Object} The match or undefined if not exists
 */
module.exports.getMatch = function (id, callback) {
    var result = store[id];
    if(!!callback){
        callback(null, result);
    }
};

/**
 * Creates a new match in the store. This created match with new set ID is returned.
 * Returns undefined when creating failed.
 *
 * @param {Object} match Template for the new match
 * @returns {Object} the created match
 */
module.exports.createMatch = function (match, callback) {
    if(!match){
        if(!!callback){
            callback(new Error("Can't store the match because the first param 'match' was invalid."),null);
        }
    }

    if(! (match instanceof model.Match)){
        match = new model.Match(match);
    }

    match.matchId = createID();
    store[match.matchId] = match;


    if(!!callback){
        callback(null, match);
    }

};

/**
 * Updates the given match in the store. Returns false if the operation failed or the match does not exist.
 *
 * @param {Object} match
 * @returns {Boolean} false if the operation failed or the match does not exist, true otherwise
 */
module.exports.updateMatch = function (match, callback) {
    store[match.matchId] = match;
    if(!!callback){
        callback(null, match);
    }
};

module.exports.deleteMatch = function(matchId, callback){
    store[matchId] = null;

    if(!!callback){
        callback(null);
    }
}


var _id = 1;
var createID = function() {
   return (_id++).toString();
};


