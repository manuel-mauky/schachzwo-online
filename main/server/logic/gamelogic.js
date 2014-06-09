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
    CHECK_TARGET_BOTH: "check:target_both",
    STATE_MATE: "stale_mate"
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
            var checkType = CheckType.CHECK_TARGET;
            var enemyZenithField = color == Color.BLACK ? getZenithPosition(Color.WHITE, board) : getZenithPosition(Color.BLACK, board);
            var enemyZenithRange = accessor.getRangeForPosition(enemyZenithField.position);
            enemyZenithRange.some(function (element) {
                if (accessor.isOrigin(element.column, element.row)) {
                    checkType = CheckType.CHECK_TARGET_BOTH;
                    return true;
                }
            });
            return checkType;
        }

        //Schach / Schachmatt / Patt
        else {
            var zenithThreatenPositions = accessor.getThreatenPositions(zenithField.position.column, zenithField.position.row);
            if (zenithThreatenPositions.length == 0) {
                var validMoves = accessor.getValidMoves(color);
                if(validMoves.length == 1 && validMoves[0].field.figure.type == FigureType.ZENITH){
                    return CheckType.STATE_MATE;
                }else{
                    return CheckType.NONE;
                }
            }

            //SCHACH! -> prüfung ob schach Matt durch indirekten Beweis
            var isCheckMate = true;
            //zenith bewegen
            var zenithRange = accessor.getRangeForPosition(zenithField.position);
            zenithRange.some(function (element) {
                match.addMoveFromPosition(zenithField.position,element);
                var threaten = accessor.getThreatenPositions(element.column, element.row);
                if (threaten.length == 0) {
                    isCheckMate = false;
                }
                match.historyPop();
                return (!isCheckMate);
            });
            if (!isCheckMate) return CheckType.CHECK;

            //figuren schlagen
            zenithThreatenPositions.some(function (enemyField) {
                var enemyThreatenPositions = accessor.getThreatenPositions(enemyField.column, enemyField.row);
                enemyThreatenPositions.some(function (element) {
                    match.addMoveFromPosition(element,enemyField);
                    if (accessor.getThreatenPositions(zenithField.position.column, zenithField.position.row).length == 0) {
                        isCheckMate = false;
                    }
                    match.historyPop();
                    return (!isCheckMate);
                });
                return (!isCheckMate);
            });
            if (!isCheckMate) return CheckType.CHECK;

            //figuren blockieren welche zenith bedrohen
            var validMoves = accessor.getValidMoves(color);
            zenithThreatenPositions.some(function (enemyField) {
                var enemyRangeList = accessor.getRangeForPosition(enemyField);
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

                rangeList.some(function (element) {
                    match.addMoveFromPosition(element.from,element.to);
                    if (accessor.getThreatenPositions(zenithField.position.column, zenithField.position.row).length == 0) {
                        if(element.figure.type != FigureType.ZENITH){
                            isCheckMate = false;
                        }
                    }
                    match.historyPop();
                    return (!isCheckMate);
                });
                return (!isCheckMate);
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