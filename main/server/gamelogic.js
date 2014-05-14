/**
 * Created by Erik Jähne on 09.05.2014.
 */

var model = require("./model/model");
var BoardAccessor = require("./model/board-accessor");

var FigureType = model.FigureType;
var Color = model.Color;
var Figure = model.Figure;

module.exports = function GameLogic(match){
    var accessor = new BoardAccessor(match);

    /**
     * checks if a Player with the given Color is in Check
     * @type {isCheck}
     */
    var isCheck = this.isCheck = function(color){
        var board = match.getCurrentSnapshot();
        var zenithField = getZenithPosition(color,board);
        var threadenFields = accessor.getThreatenFields(zenithField.position.column,zenithField.position.row);
        if(threadenFields.length > 0) return true;
        else return false;
    };

    /**
     * Returns the Position of the Zenith of the given Playercolor on the given board
     * @type {getZenithPosition}
     */
    var getZenithPosition = this.getZenithPosition = function(color,bord) {
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
    var isValidMove = this.isValidMove = function(move){
        var board = match.getCurrentSnapshot();
        var field = board.getField(move.from.column,move.from.row);
        if(JSON.stringify(field.figure) != JSON.stringify(move.figure)) return false;
        var range = accessor.getRangeFor(move.from.column,move.from.row);
        var isValid = false;
        range.forEach(function(element){
           if(element.column == move.to.column && element.row == move.to.row) isValid = true;
        });
        return isValid;
    }

    /**
     * checks if a Player with the given Color is in CheckMate
     * @type {isCheckMate}
     */
    var isCheckMate = this.isCheckMate = function(color){
        var isCheckMate = true;
        if(!isCheck(color)) return false;
        var zenithField = getZenithPosition(color,bord);
        var zenithThreadenFields = accessor.getThreatenFields(zenithField.position.column,zenithField.position.row);
        var zenithRange = accessor.getRangeFor(zenithField.position.column,zenithField.position.row);

        //zenith bewegen
        zenithRange.forEach(function(element){
            match.history.push(new model.Move({figure: zenithField.figure,from: zenithField.position, to: element.position}));
            var threaten = accessor.getThreatenFields(element.position.column,element.position.row);
            if(threaten.length == 0){
                isCheckMate = false;
                return;
            }
            match.history.pop();
        });
        if(!isCheckMate) return false;

        //figuren schlagen
        zenithThreadenFields.forEach(function(enemyField){
            var enemyThreatenFields = accessor.getThreatenFields(enemyField.position.column,enemyField.position.row);
            enemyThreatenFields.forEach(function(element){
                match.history.push(new model.Move({figure: element.figure,from: element.position, to: enemyField.position}));
                if(accessor.getThreatenFields(zenithField.position.column,zenithField.position.row).length == 0){
                    isCheckMate = false;
                    return;
                }
                match.history.pop();
            });
            if(!isCheckMate) return;
        });

        //figuren blokieren welche zenith bedrohen
        zenithThreadenFields.forEach(function(enemyField){
            var enemyRangeList = accessor.getRangeFor(enemyField.position.column,enemyField.position.row);
            enemyRangeList.forEach(function(element){
                match.history.push(new model.Move({figure: enemyField.figure,from: enemyField.position, to: element.position}));
                var threaten = accessor.getThreatenFields(element.position.column,element.position.row);
                if(threaten > 0 && !isCheck(color)){
                    isCheckMate = false;
                    return;
                }
                match.history.pop();
            });
            if(!isCheckMate) return;
        });
        return isCheckMate;
    }
};