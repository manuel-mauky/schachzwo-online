"use strict";
/**
 * Created by Erik Jähne on 14.05.2014.
 */
var uuid = require("node-uuid");
var model = require("../model/model");
var DB = require('mongodb').Db;
var Server = require('mongodb').Server;
var db;
var schachzwo;

var createConnection = function(){
    db = new DB('schachzwo', new Server("127.0.0.1", 27017,{auto_reconnect: true}), {});
    db.open(function(){
        schachzwo = db.createCollection("schachzwo",{});
        db.close();
    });
    //schachzwo = db.collection("schachzwo");


}

/**
 * Returns a match with a given ID. If the requested match does not exist, undefined is returned.
 *
 * @param {String} id the ID of the match
 * @returns {Object} The match or undefined if not exists
 */
module.exports.get = function (id) {
    if(!db) createConnection();
    return schachzwo.find({matchid: id});
};


module.exports.getAll = function(){
    if(!db) createConnection();
    var result;
    db.open(function(err, db) {
        result = schachzwo.find();
        db.close();
    });
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
    if(!db) createConnection();
    match.matchId = uuid.v4();
    db.open(function(){
        schachzwo.insert(match);
        db.close();
    });
    return match;
};

/**
 * Updates the given match in the store. Returns false if the operation failed or the match does not exist.
 *
 * @param {Object} match
 * @returns {Boolean} false if the operation failed or the match does not exist, true otherwise
 */
module.exports.update = function (match) {
    if(!db) createConnection();
    var result;
    db.open(function(err, db) {
        result = schachzwo.update({matchid: id},match);
        db.close();
    });
    return result;
};