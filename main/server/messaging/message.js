"use strict";

/**
 * The possible messages that may be sent to the client.
 *
 * @type {{
 * UPDATE: string,
 * GAME_STARTED: string,
 * DRAW_OFFERED: string,
 * DRAW_ACCEPTED: string,
 * DRAW_REJECTED: string,
 * HAS_WON_BY_CHECK_TARGET: string,
 * HAS_WON_BY_CHECK_MATE: string,
 * HAS_WON_BY_GIVEN_UP: string,
 * HAS_LOST_BY_CHECK_TARGET: string,
 * HAS_LOST_BY_CHECK_MATE: string,
 * HAS_LOST_BY_GIVEN_UP: string,
 * HAS_LOST_BUT_CAN_FOLLOW_UP: string,
 * IS_IN_CHECK: string}}
 */
module.exports = {
    UPDATE: "update",
    MATCH_STARTED: "match-started",
    DRAW_OFFERED: "draw-offered",
    DRAW_ACCEPTED: "draw-accepted",
    DRAW_REJECTED: "draw-rejected",
    HAS_WON_BY_CHECK_TARGET: "won-check-target",
    HAS_WON_BY_CHECK_TARGET_AND_OPPONENT_FOLLOW_UP: "won-check-target-and-opponent-follow-up",
    HAS_WON_BY_CHECK_MATE: "won-check-mate",
    HAS_WON_BY_GIVEN_UP: "won-given-up",
    HAS_LOST_BY_CHECK_TARGET: "lost-check-target",
    HAS_LOST_BY_CHECK_MATE: "lost-check-mate",
    HAS_LOST_BY_GIVEN_UP: "lost-given-up",
    HAS_LOST_BUT_CAN_FOLLOW_UP: "lost-can-follow-up",
    IS_IN_CHECK: "check",
    STALE_MATE: "stale-mate"
};
