/**
 * Created by Admin on 15.05.2014.
 */

MongoProvider = require("./mongoProvider");

var StoreType = {

    MEMORY: 1,
    MONGODB: 2
}

module.exports = function StoreProvider(storeType){
    var store;

    switch (storeType){
        case StoreType.MEMORY:  store = new match.store();
        case StoreType.MONGODB: store = new MongoProvider();
    }

    this.getMatch = function (id,resultCallback) {
        store.getMatch(id,resultCallback);
    };
    this.getAllMatches = function(resultCallback){
        store.getAllMatches(resultCallback);
    };
    this.createMatch = function (match,resultCallback) {
        return store.createMatch(match,resultCallback);
    };
    this.deleteMatch = function (match,resultCallback) {
        store.deleteMatch(match,resultCallback);
    };
}

module.exports.StoreType = StoreType;