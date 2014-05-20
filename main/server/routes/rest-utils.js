"use strict"

var matches = require("./matches");

/**
 * Returns the playerId (if any) from the given request.
 *
 * There are several ways to define a playerId in a request, f.e. in a cookie.
 *
 * If a playerId was found in the given request it will be returned. Otherwise
 * nothing/undefined will be returned.
 *
 * @param req
 * @returns {*}
 */
module.exports.findPlayerId = function (req) {

    var playerId = req.cookies[matches.PLAYER_COOKIE_NAME];
    if (!playerId) {
        var header = req.header('Authorization');
        if (header) {
            var value = header.split(/\s+/);
            var id = value.pop();
            if (matches.HTTP_AUTHORIZATION_METHOD === value.pop()) {
                playerId = id;
            }
        }
    }

    return playerId;
};

/**
 * Checks whether the player with the given playerId is participating on the given match. In this case this method
 * returns <code>true</code>.
 *
 * When the no playerId is given or there is no player with this Id part of the match, this method returns <code>false</code>.
 *
 *
 * @param match
 * @param playerId
 * @returns {boolean}
 */
module.exports.isPlayerParticipating = function (match, playerId) {
    if(playerId){
        return (playerId == match.playerBlack.playerId || playerId == match.playerWhite.playerId);
    }else{
        return false;
    }
};
