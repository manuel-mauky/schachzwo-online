/**
 * Created by Erik Jähne on 09.05.2014.
 */

var model = require("./../model/model");
var BoardAccessor = require("./board-accessor");

var FigureType = model.FigureType;
var Color = model.Color;
var Figure = model.Figure;

var CheckType = {
    NONE: 1,
    CHECK: 2,
    CHECK_MATE: 3,
    CHECK_FINISH: 4,
    CHECK_FINISH_BOTH: 5
}

module.exports.CheckType = CheckType;
module.exports.GameLogic = function GameLogic(match) {
    var accessor = new BoardAccessor(match);
    var match = match;
    /**
     * returns the Check Type of a Player with the given Color.
     * If color is not set, it takes the Color from the active Player
     * @type {getCheckType}
     */
    var getCheckType = this.getCheckType = function (color) {
        if (!color) color = match.getColorOfActivePlayer();
        var board = match.getCurrentSnapshot();
        var zenithField = getZenithPosition(color, board);

        //Schach Ziel
        if (accessor.isOrigin(zenithField.position.collumn, zenithField.position.row)) {
            var enemyZenithField;
            if (color == Color.BLACK) {
                enemyZenithField = getZenithPosition(Color.WHITE, board);
            }
            else {
                enemyZenithField = getZenithPosition(Color.BLACK, board);
            }
            enemyZenithRange = accessor.getRangeFor(enemyZenithField.position.collumn, enemyZenithField.position.row);
            enemyZenithRange.forEach(function (element) {
                if (accessor.isOrigin(enemyZenithField.position.collumn, enemyZenithField.position.row)) {
                    return CheckType.CHECK_FINISH_BOTH;
                }
            });
            return CheckType.CHECK_FINISH;
        }

        //Schach / Schachmatt
        else {
            var zenithThreadenPositions = accessor.getThreatenPositions(zenithField.position.column, zenithField.position.row);
            var zenithRange = accessor.getRangeFor(zenithField.position.column, zenithField.position.row);
            var isCheckMate = true;

            if (zenithThreadenPositions.length == 0) return CheckType.NONE;

            //zenith bewegen
            zenithRange.forEach(function (element) {
                if (!isCheckMate) return;
                match.history.push(new model.Move({figure: board.getFieldFromPosition(zenithField.position).figure, from: zenithField.position, to: element}));
                var threaten = accessor.getThreatenPositions(element.column, element.row);
                if (threaten.length == 0) {
                    isCheckMate = false;
                }
                match.history.pop();
            });
            if (!isCheckMate) return CheckType.CHECK;

            //figuren schlagen
            zenithThreadenPositions.forEach(function (enemyField) {
                var enemyThreatenPositions = accessor.getThreatenPositions(enemyField.column, enemyField.row);
                enemyThreatenPositions.forEach(function (element) {
                    if (!isCheckMate) return;
                    match.history.push(new model.Move({figure: board.getFieldFromPosition(element).figure, from: element, to: enemyField}));
                    if (accessor.getThreatenPositions(zenithField.column, zenithField.row).length == 0) {
                        isCheckMate = false;
                    }
                    match.history.pop();
                });
                if (!isCheckMate) return;
            });
            if (!isCheckMate) return CheckType.CHECK;

            //figuren blokieren welche zenith bedrohen
            zenithThreadenPositions.forEach(function (enemyField) {
                console.log(enemyField);
                var enemyRangeList = accessor.getRangeFor(enemyField.column, enemyField.row);
                enemyRangeList.forEach(function (element) {
                    if (!isCheckMate) return;
                    match.history.push(new model.Move({figure: board.getFieldFromPosition(enemyField).figure, from: enemyField, to: element}));
                    var threaten = accessor.getThreatenPositions(element.column, element.row);
                    if (threaten > 0 && !isCheck(color)) {
                        isCheckMate = false;
                    }
                    match.history.pop();
                });
                if (!isCheckMate) return CheckType.CHECK;
            });
            return CheckType.CHECK_MATE;
        }
    }

    /**
     * Returns the Position of the Zenith of the given Playercolor on the given board
     * @type {getZenithPosition}
     */
    var getZenithPosition = this.getZenithPosition = function (color, bord) {
        for (var i = 0; i < match.size; i++) {
            for (var j = 0; j < match.size; j++) {
                var field = bord.getField(i, j);
                if (field.figure && field.figure.type == FigureType.ZENITH && field.figure.color == color) {
                    return bord.getField(i, j);
                }
            }
        }
    };

    /**
     * Checks if a Move is valid on checking the move.from Field with the snapshot and the move.to field with the Range of this figure
     * @type {isValidMove}
     */
    this.isValidMove = function (playerId, move) {

        try {
            move = new model.Move(move);
        } catch (error) {
            return false;
        }

        if (match.getColorOfActivePlayer() == model.Color.BLACK) {
            // blacks turn
            if (match.playerBlack.playerId != playerId || move.figure.color == model.Color.WHITE) {
                return false;
            }
        } else {
            // whites turn
            if (match.playerWhite.playerId != playerId || move.figure.color == model.Color.BLACK) {
                return false;
            }
        }

        var board = match.getCurrentSnapshot();
        var field = board.getField(move.from.column, move.from.row);
        if (JSON.stringify(field.figure) != JSON.stringify(move.figure)) return false;
        var range = accessor.getRangeFor(move.from.column, move.from.row);
        var isValid = false;
        range.forEach(function (element) {
            if (element.column == move.to.column && element.row == move.to.row) isValid = true;
        });
        return isValid;
    };

    /**
     * Checks whether the player with the given playerId is participating on the given match. In this case this method
     * returns <code>true</code>.
     *
     * When the no playerId is given or there is no player with this Id part of the match, this method returns <code>false</code>.
     *
     *
     * @param playerId
     * @returns {boolean}
     */
    this.isPlayerParticipating = function (playerId) {
        if (playerId) {
            return ((match.playerBlack && playerId == match.playerBlack.playerId) ||
                (match.playerWhite && playerId == match.playerWhite.playerId));
        } else {
            return false;
        }
    };
};