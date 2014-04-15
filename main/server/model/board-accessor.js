"use strict"

/**
 * BoardAccessor. This module contains functions for accessing
 * fields and figures from the chess board.
 */



var model = require("./model");

var FigureType = model.FigureType;
var Color = model.Color;

module.exports = function BoardAccessor(match) {
    if (!match) {
        throw new Error("Expected constructor param 'match' is missing!");
    }

    this.match = match;


    /**
     * get the range of fields that the figure on the given position can reach.
     * @param column
     * @param row
     */
    this.getRangeFor = function (column, row) {
        var snapshot = this.match.getCurrentSnapshot();

        var figure = snapshot.getField(column, row).figure;

        if (!figure) {
            return new Array();
        }

        switch (figure.type) {
            case FigureType.ROCKS:
                return getRangeForRocks(column, row);

            default:
                return new Array();
        }

    };

    var getRangeForRocks = function (column, row) {
        var board = match.getCurrentSnapshot();

        var current = board.getField(column, row).figure;

        var result = new Array();

        var rowTmp = row;
        if (current.color == Color.WHITE) {
            rowTmp++;
        }
        if (current.color == Color.BLACK) {
            rowTmp--;
        }

        var columnTmp = column;


        if (isOrigin(columnTmp, rowTmp)) {
            var left = board.getField(columnTmp - 1, rowTmp).figure;
            var right = board.getField(columnTmp + 1, rowTmp).figure;

            if (!left || left.color != current.color) {
                result.push({column: columnTmp - 1, row: rowTmp});
            }

            if (!right || right.color != current.color) {
                result.push({column: columnTmp + 1, row: rowTmp});
            }

        } else {
            var figure = board.getField(columnTmp, rowTmp).figure;
            if (!figure) {
                result.push({column: columnTmp, row: rowTmp});
            }


            var leftField = board.getField(columnTmp - 1, rowTmp);
            if (leftField) {
                var left = board.getField(columnTmp - 1, rowTmp).figure;
                if (left && left.color != current.color) {
                    result.push({column: columnTmp - 1, row: rowTmp});
                }
            }


            var rightField = board.getField(columnTmp + 1, rowTmp);
            if (rightField) {
                var right = board.getField(columnTmp + 1, rowTmp).figure;
                if (right && right.color != current.color) {
                    result.push({column: columnTmp + 1, row: rowTmp});
                }
            }
        }


        // for Big boards there is the special rule of walking two fields from the start
        if (match.size == model.BoardSize.BIG) {
            if (current.color == Color.WHITE && row == 1) {
                rowTmp = row + 2;
            }

            if (current.color == Color.BLACK && row == (match.size - 2)) {
                rowTmp = row - 2;
            }

            var figure = board.getField(columnTmp, rowTmp).figure;
            if (!figure) {
                result.push({column: columnTmp, row: rowTmp});
            }
        }

        return result;
    }


    var isOrigin = function (x, y) {
        var size = match.size;

        var isBigOrigin = (size == model.BoardSize.BIG && (x == 4 && y == 4));
        var isSmallOrigin = (size == model.BoardSize.SMALL && (x == 3 && y == 3));

        return isBigOrigin || isSmallOrigin;
    }


    return this;
};


