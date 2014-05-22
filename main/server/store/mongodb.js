"use strict";

var uuid = require("node-uuid");
var model = require("../model/model");

var db = require('mongoskin').db('mongodb://localhost:27017/schachzwo');

var MongDB = function() {

    this.getMatch = function (id,resultCallback) {
        db.collection('matches').findOne({matchId: id}, function(err,item){
                resultCallback(err,item);
        });
    };

    this.deleteMatch = function (id,resultCallback) {
        db.collection('matches').remove({matchId: id},function(err){
            resultCallback(err);
        });
    };

    this.createMatch = function (match,resultCallback) {
        if(!!match){
            match.matchId = uuid.v4();
            db.collection('matches').insert(match,function(err){
                if(resultCallback) resultCallback(err, match);
            });
        }else{
            if(!!resultCallback){
                resultCallback(new Error("Can't create match. First param has to be a valid match instance"), null);
            }
        }
    };

    this.updateMatch = function(match, resultCallback) {


    }


};

module.exports = MongDB;
