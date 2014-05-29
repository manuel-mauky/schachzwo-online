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
        'Access-Control-Allow-Origin': '*'
    });

    var clientId = Object.keys(clients).length;

    res.write(":" + Array(2049).join(" ") + "\n"); //for IE
    res.write("retry: 2000\n");

    clients[clientId] =
    {
        res: res,
        matchId: matchId,
        playerId: playerId
    };
};

/**
 * Disconnect all clients for the given match.
 *
 * @param matchId the ID of the match
 */
module.exports.disconnectClients = function(matchId) {

    for (var clientId in clients) {
        var client = clients[clientId];

        if (client.matchId === matchId) {
            client.res.send();
            delete clients[clientId];
        }
    }
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
