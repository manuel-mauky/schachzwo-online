
var assert = require("assert");
var model = require("./model");


describe("Creation of Figure", function(){
    "use strict";

    var Figure = model.Figure;
    var Color = model.Color;
    var FigureType = model.FigureType;

    it("should be possible to with empty constructor", function(){


        var rocks = new Figure();


        assert.ok(rocks);
        assert.equal(rocks.color, "");
        assert.equal(rocks.figureType,"");

    })


    it("should be possible with constructor params", function(){

        var man = new model.Figure({color:Color.BLACK, figureType: FigureType.MAN});

        assert.ok(man);
        assert.equal(man.color, Color.BLACK);
        assert.equal(man.figureType, FigureType.MAN);

    })

})
