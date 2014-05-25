"use strict";

var model = require("../model/model");

// Store as a simple data structure in memory
var store = {};


/**
 * Loads the match with the given ID.
 * If the match doesn't exist, the callback will get "null" as match param (which means that not finding
 * the match isn't an error case).
 *
 * @param {String} id the ID of the match
 * @param {Function} callback, 1. param: err, 2. param: the found match or null if no match can be found
 */
module.exports.getMatch = function (id, callback) {
    var result = store[id];
    if(!!callback){
        if(result){
            callback(null, result);
        }else{
            callback(null, null);
        }
    }
};

/**
 * Creates a new match in the store.
 *
 * @param {Object} match Template for the new match
 * @param {Function} callback, 1. param: err, 2. param: the created match
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
 * Updates the given match in the store.
 *
 * @param {Object} match
 * @param {Function} callback, 1. param: err, 2. param: the updated match
 */
module.exports.updateMatch = function (match, callback) {
    store[match.matchId] = match;
    if(!!callback){
        callback(null, match);
    }


};

/**
 * Deletes the match with the given id.
 *
 * @param matchId
 * @param callback
 */
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


