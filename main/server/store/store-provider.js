/**
 * Created by Admin on 15.05.2014.
 */

"use strict";

var MongoDB = require("./mongodb");
var inmemoryStore = require("./inmemory-store");

var StoreType = {

    INMEMORY: 1,
    MONGODB: 2
}

module.exports.activeStoreType = StoreType.INMEMORY;

module.exports.getStore = function(){
    "use strict";
    switch (module.exports.activeStoreType){
        case StoreType.INMEMORY:  return inmemoryStore;
        case StoreType.MONGODB: return new MongoDB();
    }
};

module.exports.StoreType = StoreType;