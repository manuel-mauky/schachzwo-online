/**
 * Created by Erik Jähne on 09.05.2014.
 */

var model = require("./model/model");
var BoardAccessor = require("./model/board-accessor");

var FigureType = model.FigureType;
var Color = model.Color;

module.exports = function GameLogic(match){
    var accessor = new BoardAccessor(match);
    var isCheck = this.isCheck = function(color){
        var bord = match.getCurrentSnapshot();
        var zenitField = getZenitPosition(color,bord);
        var threadenFields = accessor.getThreatenFields(zenitField.position.column,zenitField.position.row);
        if(threadenFields.length > 0) return true;
        else return false;
    };

    var getZenitPosition = this.getZenitPosition = function(color,bord){
        for(var i=0 ; i< match.size ; i++){
            for(var j=0 ; j<match.size ; j++) {
                var field = bord.getField(i,j);
                if(field.figure && field.figure.type == FigureType.ZENITH && field.figure.color ==  color) {
                    return bord.getField(i,j);
                }
            }
        }
    }




};