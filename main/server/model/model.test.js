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
        assert.notOk(rocks.figureType);
    });


    it("should be possible with constructor params", function(){

        var man = new model.Figure({color:Color.BLACK, figureType: FigureType.MAN});

        assert.ok(man);
        assert.equal(man.color, Color.BLACK);
        assert.equal(man.figureType, FigureType.MAN);
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
                                figureType: "rocks"
                            },
                            file: 0,
                            rank: 0
                        },
                        {
                            file: 0,
                            rank: 1
                        },
                        {
                            file: 1,
                            rank: 1
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

        assert.equal(match.state, State.PLAYING);

        assert.equal(match.size,7);


        assert.isArray(match.history);
        assert.equal(match.history.length, 1);


        var rocks = new Figure({color:"black", figureType:"rocks"});

        var snapshot = match.history[0];
        assert.ok(snapshot);
        assert.isArray(snapshot.board);
        assert.equal(snapshot.board.length,3);

        assert.deepEqual(snapshot.board[0], new Field({figure:rocks, file:0, rank:0}));
        assert.deepEqual(snapshot.board[1], new Field({file:0, rank:1}));
        assert.deepEqual(snapshot.board[2], new Field({file:1, rank:1}));
    });

})
