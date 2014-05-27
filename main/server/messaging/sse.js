"use strict";

var clients = {};


/**
 * Initializes a new SSE client for the given matchId. If no playerId given, then a client for a spectator is initialized.
 * This will only receive messaging for the given match that are not addressed to a specific player.
 *
 * @param req the request
 * @param res the response
 * @param matchId the ID of the match
 * @param [playerId] the ID of the player
 * @returns {*}
 */
module.exports.initClient = function (req, res, matchId, playerId) {


    req.socket.setTimeout(Infinity);
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    var clientId = Object.keys(clients).length;

    clients[clientId] =
    {
        res: res,
        matchId: matchId,
        playerId: playerId
    };
};


/**
 * Sends a message to clients of the given match. Sends the message to all, if not a concrete player is specified.
 *
 * @param message the message
 * @param matchId the ID of the match
 * @param [playerId] the ID of the player
 */
module.exports.sendMessage = function (message, matchId, playerId) {

    for (var clientId in clients) {
        var client = clients[clientId];

        if (client.matchId === matchId && (!playerId || client.playerId === playerId)) {
            client.res.write("data: " + message + "\n\n");
        }
    }
};
