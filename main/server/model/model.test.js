"use strict"


var assert = require("chai").assert;
var model = require("./model");


var BoardSize = model.BoardSize;
var Color = model.Color;
var FigureType = model.FigureType;
var Figure = model.Figure;
var Field = model.Field;
var Player = model.Player;
var State = model.State;
var Match = model.Match;
var Snapshot = model.Snapshot;

describe("Creation of Figure", function(){

    it("should be possible to with empty constructor", function(){

        var rocks = new Figure();

        assert.ok(rocks);
        assert.notOk(rocks.color);
        assert.notOk(rocks.type);
    });


    it("should be possible with constructor params", function(){

        var man = new model.Figure({color:Color.BLACK, type: FigureType.MAN});

        assert.ok(man);
        assert.equal(man.color, Color.BLACK);
        assert.equal(man.type, FigureType.MAN);
    });

})

describe("Creation of Match", function(){

    it("should be possible with empty constructor", function(){
        var match = new Match();

        assert.ok(match);

        assert.isArray(match.history);
        assert.equal(match.history.length, 0);
    });

    it("should be possible from json", function(){

        var json = {

            matchId : "12345",

            playerWhite: {
                playerId: "102",
                name: "max mustermann"
            },
            playerBlack: {
                playerId: "104",
                name: "john doe"
            },

            state: "playing",

            size : 7,
            history: [
                {
                    board:[
                        {
                            figure: {
                                color: "black",
                                type: "rocks"
                            },
                            column: 0,
                            row: 0
                        },
                        {
                            column: 0,
                            row: 1
                        },
                        {
                            column: 1,
                            row: 1
                        }
                    ]
                }
            ]
        };

        var match = new Match(json);

        assert.ok(match);

        assert.equal(match.matchId, "12345");

        var max = new Player({playerId:"102", name:"max mustermann"});
        var john = new Player({playerId:"104", name:"john doe"});

        assert.deepEqual(match.playerWhite,max);
        assert.deepEqual(match.playerBlack, john);
        assert.instanceOf(match.playerBlack, Player);
        assert.instanceOf(match.playerWhite, Player);

        assert.equal(match.state, State.PLAYING);

        assert.equal(match.size,7);


        assert.isArray(match.history);
        assert.equal(match.history.length, 1);


        var rocks = new Figure({color:"black", type:"rocks"});

        var snapshot = match.history[0];
        assert.ok(snapshot);
        assert.isArray(snapshot.board);
        assert.equal(snapshot.board.length,3);

        assert.deepEqual(snapshot.board[0], new Field({figure:rocks, column:0, row:0}));
        assert.deepEqual(snapshot.board[1], new Field({column:0, row:1}));
        assert.deepEqual(snapshot.board[2], new Field({column:1, row:1}));

        assert.instanceOf(snapshot.board[0].figure, Figure);
    });

})

describe("GetField accessor function of Snapshot", function(){

    var rocks1 = new Figure({color:Color.BLACK,type:FigureType.ROCKS});
    var rocks2 = new Figure({color:Color.WHITE,type:FigureType.ROCKS});

    var snapshot = new Snapshot();
    snapshot.board.push(new Field({column:0,row:0}));
    snapshot.board.push(new Field({column:0,row:1}));
    snapshot.board.push(new Field({column:0,row:2,figure:rocks1}));
    snapshot.board.push(new Field({column:1,row:0}));
    snapshot.board.push(new Field({column:1,row:1}));
    snapshot.board.push(new Field({column:1,row:2}));
    snapshot.board.push(new Field({column:2,row:0, figure:rocks2}));
    snapshot.board.push(new Field({column:2,row:1}));
    snapshot.board.push(new Field({column:2,row:2}));

    it("should return the properly field", function(){

        var x0y0 = snapshot.getField(0,0);
        assert.ok(x0y0);
        assert.instanceOf(x0y0,Field);


        var x0y2 = snapshot.getField(0,2);
        assert.ok(x0y2);
        assert.deepEqual(x0y2.figure, rocks1);

    });

    it("should return undefined for out-of-bounds coordinates", function(){
        var x3y0 = snapshot.getField(3,0);
        assert.isUndefined(x3y0);
    })
})
