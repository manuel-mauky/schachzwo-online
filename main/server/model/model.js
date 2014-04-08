
var Color = {
    BLACK : "black",
    WHITE : "white"
}

var FigureType = {
    ROCKS : "rocks",
    MAN : "man",
    WOMAN : "woman",
    JUMPER : "jumper"
}

var Figure = function(json){
    "use strict";
    this.id;

    var json = json || 0;

    this.color= json.color || "";
    this.figureType = json.figureType || "";

    return this;
}

module.exports.Figure = Figure;
module.exports.Color = Color;
module.exports.FigureType = FigureType;