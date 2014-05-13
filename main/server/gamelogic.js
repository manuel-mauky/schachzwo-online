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
    var isCheck = this.isCheck = function(color){
        var bord = match.getCurrentSnapshot();
        var zenitField = getZenitPosition(color,bord);
        var threadenFields = accessor.getThreatenFields(zenitField.position.column,zenitField.position.row);
        if(threadenFields.length > 0) return true;
        else return false;
    };

    var getZenitPosition = this.getZenitPosition = function(color,bord) {
        for (var i = 0; i < match.size; i++) {
            for (var j = 0; j < match.size; j++) {
                var field = bord.getField(i, j);
                if (field.figure && field.figure.type == FigureType.ZENITH && field.figure.color == color) {
                    return bord.getField(i, j);
                }
            }
        }
    };

    var isCheckMate = this.isCheckMate = function(color){
        var isCheckMate = true;
        if(!isCheck(color)) return false;
        var zenithField = getZenitPosition(color,bord);
        var zenithThreadenFields = accessor.getThreatenFields(zenithField.position.column,zenithField.position.row);
        var zenithField = accessor.getRangeFor(zenithField.position.column,zenithField.position.row);

        //override getField for local manipulation and check testing
        var functionBuffer = accessor.getField;
        var bord = match.getCurrentSnapshot();
        accessor.getField = function(column,row){return bord;};

        //zenith bewegen
        zenithField.forEach(function(element){
            bord.getFieldFromPosition(element.position).figure = zenithField.figure;
            var threaten = accessor.getThreatenFields(element.position.column,element.position.row);
            if(threaten.length == 0){
                isCheckMate = false;
                return;
            }
            bord.getFieldFromPosition(element.position).figure = undefined;
        });
        if(!isCheckMate) return false;

        //figuren schlagen
        if(zenithThreadenFields.length > 1) return true; //unmöglich 2 figuren in einem zug zu schlagen / blockieren
        var enemyField = zenithThreadenFields[1];
        var figureThreatenFields = accessor.getThreatenFields(enemyField.position.column,enemyField.position.row);

        figureThreatenFields.forEach(function(element){
           var figure1 = bord.getFieldFromPosition(element.position).figure;
           var figure2 = bord.getFieldFromPosition(zenithThreadenFields[1].position).figure;
            bord.getFieldFromPosition(enemyField.position).figure = figure1;
            bord.getFieldFromPosition(element.position).figure = undefined;
            if(accessor.getThreatenFields(zenithField.position.column,zenithField.position.row).length == 0){
                isCheckMate = false;
                return;
            }
            bord.getFieldFromPosition(element.position).figure = figure1;
            bord.getFieldFromPosition(zenithThreadenFields[1].position).figure = figure2;
        });
        accessor.getField = functionBuffer;
        if(!isCheckMate) return false;

        //figuren blokieren welche zenith bedrohen //schnittmenge aus eigenen figuren und gegnerrücken
        var enemyRangeList = accessor.getRangeFor(enemyField.position.column,enemyField.position.row);
        enemyRangeList.forEach(function(element){
            bord.getFieldFromPosition(element.position).figure = new Figure({type:FigureType.ROCKS, color: color});
            if(! isCheck(color)){
                //feld erreichbar? -> feind setzen und über isThreaten
                bord.getFieldFromPosition(element.position).figure = new Figure({type:FigureType.ROCKS, color: enemyField.figure.color});
                var threaten = accessor.getThreatenFields(element.position.column,element.position.row);
                if(threaten > 0){
                    isCheckMate = false;
                    return;
                }
            }
            bord.getFieldFromPosition(element.position).figure = undefined;
        });
        return isCheckMate;
    }
};