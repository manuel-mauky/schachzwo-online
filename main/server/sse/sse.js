"use strict";

/**
 * The possible messages that can be sent to the SSE.
 *
 * @type {{UPDATE: string, DRAW_OFFERED: string, DRAW_ACCEPTED: string, DRAW_REJECTED: string, HAS_WON_BY_CHECK_TARGET: string, HAS_WON_BY_CHECK_MATE: string, HAS_WON_BY_GIVEN_UP: string, HAS_LOST_BY_CHECK_TARGET: string, HAS_LOST_BY_CHECK_MATE: string, HAS_LOST_BY_GIVEN_UP: string, HAS_LOST_BUT_CAN_FOLLOW_UP: string, IS_IN_CHECK: string}}
 */
module.exports.SSEMessage = {
    UPDATE: "update",
    DRAW_OFFERED: "draw-offered",
    DRAW_ACCEPTED: "draw-accepted",
    DRAW_REJECTED: "draw-rejected",
    HAS_WON_BY_CHECK_TARGET: "won-check-target",
    HAS_WON_BY_CHECK_MATE: "lost-check-target",
    HAS_WON_BY_GIVEN_UP: "lost-check-mate",
    HAS_LOST_BY_CHECK_TARGET: "lost-check-target",
    HAS_LOST_BY_CHECK_MATE: "lost-check-mate",
    HAS_LOST_BY_GIVEN_UP: "lost-given-up",
    HAS_LOST_BUT_CAN_FOLLOW_UP: "lost-can-follow-up",
    IS_IN_CHECK: "check"
};

var clientId = 0;
var clients = {};


/**
 * Initializes a new SSE client for the given matchId. If no playerId given, then a client for a spectator is initialized.
 * This will only receive messages for the given match that are not addressed to a specific player.
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

    res.write('\n');

    clients[++clientId] =
    {
        res: res,
        matchId: matchId,
        playerId: playerId
    };

    req.on("close", function () {
        delete clients[clientId]
    });

    return res;
};

/**
 * Sends a message to clients of the given match. Sends the message to all, if not a concrete player is specified.
 *
 * @param message the message
 * @param matchId the ID of the match
 * @param [playerId] the ID of the player
 */
module.exports.sendMessage = function (message, matchId, playerId) {
    for (clientId in clients) {
        var client = clients[clientId];
        if (client.matchId === matchId && (!playerId || client.playerId === playerId)) {
            client.res.write("data: " + message + "\n\n");
        }
    }
};
