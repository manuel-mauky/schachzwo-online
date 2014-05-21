/**
 * Created by Admin on 15.05.2014.
 */

MongoDB = require("./mongodb");

var StoreType = {

    MEMORY: 1,
    MONGODB: 2
}

module.exports = function StoreProvider(storeType){
    var store;

    switch (storeType){
        case StoreType.MEMORY:  store = new match.store();
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