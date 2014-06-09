/**
 * Created by Admin on 15.05.2014.
 */

"use strict";

var MongoDB = require("./mongodb");
var inmemoryStore = require("./inmemory-store");
var CouchDB = require("./couchdb");

var StoreType = {

    INMEMORY: 1,
    MONGODB: 2,
    COUCHDB: 3
};

module.exports.activeStoreType = StoreType.MONGODB;

module.exports.getStore = function(){
    "use strict";
    switch (module.exports.activeStoreType){
        case StoreType.INMEMORY:  return inmemoryStore;
        case StoreType.MONGODB: return new MongoDB();
        case StoreType.COUCHDB: return new CouchDB();
    }
};

module.exports.StoreType = StoreType;