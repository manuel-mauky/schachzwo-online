/**
 * Created by Erik Jähne on 09.05.2014.
 */
"use strict";

var model = require("./../model/model");
var BoardAccessor = require("./board-accessor");

var FigureType = model.FigureType;
var Color = model.Color;
var Figure = model.Figure;

var CheckType = {
    NONE: "none",
    CHECK: "check",
    CHECK_MATE: "check_mate",
    CHECK_TARGET: "check_target",
    CHECK_TARGET_BOTH: "check:target_both"
};

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
        if (accessor.isOrigin(zenithField.position.column, zenithField.position.row)) {
            var enemyZenithField;
            var checkType = CheckType.CHECK_TARGET;
            if (color == Color.BLACK) {
                enemyZenithField = getZenithPosition(Color.WHITE, board);
            }
            else {
                enemyZenithField = getZenithPosition(Color.BLACK, board);
            }
            var enemyZenithRange = accessor.getRangeFor(enemyZenithField.position.column, enemyZenithField.position.row);
            enemyZenithRange.forEach(function (element) {
                if (accessor.isOrigin(element.column, element.row)) {
                    checkType = CheckType.CHECK_TARGET_BOTH;
                    return;
                }
            });
            return checkType;
        }

        //Schach / Schachmatt
        else {
            var zenithThreatenPositions = accessor.getThreatenPositions(zenithField.position.column, zenithField.position.row);
            var zenithRange = accessor.getRangeFor(zenithField.position.column, zenithField.position.row);
            var isCheckMate = true;
            var isCheck = true;

            if (zenithThreatenPositions.length == 0) return CheckType.NONE;

            //zenith bewegen
            zenithRange.forEach(function (element) {
                if (!isCheckMate) return;
                match.addMove2(zenithField.position.column,zenithField.position.row,element.column,element.row);
                var threaten = accessor.getThreatenPositions(element.column, element.row);
                if (threaten.length == 0) {
                    isCheckMate = false;
                }
                match.historyPop();
            });
            if (!isCheckMate) return CheckType.CHECK;

            //figuren schlagen
            zenithThreatenPositions.forEach(function (enemyField) {
                var enemyThreatenPositions = accessor.getThreatenPositions(enemyField.column, enemyField.row);
                enemyThreatenPositions.forEach(function (element) {
                    if (!isCheckMate) return;
                    match.addMove2(element.column,element.row,enemyField.column,enemyField.row);
                    if (accessor.getThreatenPositions(zenithField.position.column, zenithField.position.row).length == 0) {
                        isCheckMate = false;
                    }
                    match.historyPop();
                });
                if (!isCheckMate) return;
            });
            if (!isCheckMate) return CheckType.CHECK;

            //figuren blockieren welche zenith bedrohen
            var validMoves = accessor.getValidMoves(color);
            zenithThreatenPositions.forEach(function (enemyField) {
                var enemyRangeList = accessor.getRangeFor(enemyField.column, enemyField.row);
                var rangeList = [];
                enemyRangeList.forEach(function(enemyField){
                    validMoves.forEach(function(figure){
                        figure.fields.forEach(function(figureField){
                            if(figureField.column == enemyField.column && figureField.row == enemyField.row) {
                                rangeList.push({figure: figure.field.figure, from: figure.field.position,to: figureField});
                            }
                        });
                    });
                });

                rangeList.forEach(function (element) {
                    if (!isCheckMate) return;
                    match.addMove2(element.from.column,element.from.row,element.to.column,element.to.row);
                    if (accessor.getThreatenPositions(zenithField.position.column, zenithField.position.row).length == 0) {
                        if(element.figure.type != FigureType.ZENITH){
                            isCheckMate = false;
                            return;
                        }
                    }
                    match.historyPop();
                });
                if (!isCheckMate) return;
            });
            if(!isCheckMate) return CheckType.CHECK;
            return CheckType.CHECK_MATE;
        }
    }

    /**
     * Returns the Position of the Zenith of the given Playercolor on the given board
     * @type {getZenithPosition}
     */
    this.getZenithPosition = getZenithPosition;
    function getZenithPosition(color, board) {
        for (var i = 0; i < match.size; i++) {
            for (var j = 0; j < match.size; j++) {
                var field = board.getField(i, j);
                if (field.figure && field.figure.type == FigureType.ZENITH && field.figure.color == color) {
                    return board.getField(i, j);
                }
            }
        }
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