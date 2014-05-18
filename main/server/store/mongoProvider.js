/**
 * Created by Admin on 15.05.2014.
 */

var uuid = require("node-uuid");
var model = require("../model/model");

var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

//var server = new Server('localhost', 27017, {auto_reconnect: true});
//db = new Db('schachzwo', server);

var db = require('mongoskin').db('mongodb://localhost:27017/schachzwo');

/*
db.open(function(err, db) {
    if(!err) {
        db.collection('matches', {strict:true}, function(err, collection) {
            if (err) {
                db.createCollection("matches");
            }
        });
    }
});
*/

var MongoProvider = function(storeType) {

    this.getMatch = function (id,resultCallback) {
        db.collection('matches', function(err, collection) {
            collection.findOne({matchid: id}, function(err,item){
                console.error("item found");
                resultCallback(err,item);
            });
        });
    };

    this.getAllMatches = function (resultCallback) {
        var result;
        db.collection('matches', function(err, collection) {
            if(!err) collection.find({}, resultCallback);
        });
        return result;
    };

    this.deleteMatch = function (id,resultCallback) {
        var result;
        db.collection('matches', function(err, collection) {
            if(!err) collection.drop({matchid: id}, resultCallback);
        });
        return result;
    };

    this.createMatch = function (match,resultCallback) {
        match.matchId = uuid.v4();
        db.collection('matches').insert(match,function(){});
        resultCallback(undefined,match);
    };

};

module.exports = MongoProvider;
