/**
 * Created by Admin on 15.05.2014.
 */

MongoDB = require("./mongodb");
match = require("./match-store");

var StoreType = {

    MEMORY: 1,
    MONGODB: 2
}

var activeStoreType = module.exports.activeStoreType = StoreType.MEMORY;

module.exports.StoreProvider = function StoreProvider(){
    var store;

    switch (activeStoreType){
        case StoreType.MEMORY:  store = match;
        case StoreType.MONGODB: store = new MongoDB();
    }

    this.getMatch = function (id,resultCallback) {
        return store.getMatch(id,resultCallback);
    };

    this.createMatch = function (match,resultCallback) {
        return store.createMatch(match,resultCallback);
    };

    this.deleteMatch = function (id,resultCallback) {
        return store.deleteMatch(id,resultCallback);
    };

}

module.exports.StoreType = StoreType;