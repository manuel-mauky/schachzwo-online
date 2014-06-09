"use strict";

var cradle = require('cradle');
var db = new(cradle.Connection)().database('schachzwo');


var model = require("../model/model");

var CouchDB = function() {

    db.exists(function(err, exists){
        if(err){
            console.log("error", err);
        } else if(!exists){
            console.log("db does not exists");
            db.create();
        }
    });

    this.getMatch = function (id,callback) {
        db.get(id, function(err, doc){
            if(doc){
                callback(err, new model.Match(doc));
            } else {
                callback(err, null);
            }
        });
    };

    this.deleteMatch = function (id,callback) {
        db.remove(id, null, function(err, res) {
           callback(err);
        });
    };

    this.createMatch = function (match,callback) {
        if(!!match){
            db.save(match.matchId, match, function(err, res){
                if(!!callback){
                   callback(err, match);
                }
            });

        }else{
            if(!!callback){
                callback(new Error("Can't create match. First param has to be a valid match instance"), null);
            }
        }
    };

    this.updateMatch = function(match, callback) {
        db.save(match.matchId, match, function(err, res ){
            callback(err, match);
        });
    }

};

module.exports = CouchDB;

