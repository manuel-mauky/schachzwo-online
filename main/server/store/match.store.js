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
module.exports.get = function (id) {
    return store[id];
};


module.exports.getAll = function(){
    var result = [];

    for(var entry in store){
        if(store.hasOwnProperty(entry)){
            result.push(store[entry]);
        }
    }

    return result;
}

/**
 * Creates a new match in the store. This created match with new set ID is returned.
 * Returns undefined when creating failed.
 *
 * @param {Object} match Template for the new match
 * @returns {Object} the created match
 */
module.exports.create = function (match) {
    if(! (match instanceof model.Match)){
        match = new model.Match(match);
    }

    match.matchId = createID();
    store[match.matchId] = match;

    return match;
};

/**
 * Updates the given match in the store. Returns false if the operation failed or the match does not exist.
 *
 * @param {Object} match
 * @returns {Boolean} false if the operation failed or the match does not exist, true otherwise
 */
module.exports.update = function (match) {
    store[match.matchId] = match;
    return true;
};


var _id = 1;
var createID = function() {
   return (_id++).toString();
};


