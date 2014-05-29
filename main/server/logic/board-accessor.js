"use strict"

/**
 * BoardAccessor. This module contains functions for accessing
 * fields and figures from the chess board.
 */



var model = require("./../model/model");

var FigureType = model.FigureType;
var Color = model.Color;

module.exports = function BoardAccessor(match) {
    if (!match) {
        throw new Error("Expected constructor param 'match' is missing!");
    }

    this.match = match;


    var getField = function (column, row) {
        var board = match.getCurrentSnapshot();

        return board.getField(column, row);
    };

    var getFigure = function (column, row) {
        var field = getField(column, row);

        if (field) {
            return field.figure;
        } else {
            return undefined;
        }
    };

    var isOutOfBoard = function (column, row) {
        return (column < 0 || column >= match.size || row < 0 || row >= match.size);
    };

    /**
     * get the range of fields that the figure on the given position can reach.
     * @param column
     * @param row
     */
    var getRangeFor = this.getRangeFor = function (column, row) {
        var figure = getFigure(column, row);

        if (!figure) {
            return [];
        }

        switch (figure.type) {
            case FigureType.ROCKS:
                return getRangeForRocks(column, row);

            case FigureType.MAN:
                return getRangeForMan(column, row);

            case FigureType.KNIGHT:
                return getRangeForKnight(column, row);

            case FigureType.WOMAN:
                return getRangeForWoman(column, row);

            case FigureType.ZENITH:
                return getRangeForZenith(column, row);

            case FigureType.KNOWLEDGE:
                return getRangeForKnowledge(column, row);

            case FigureType.FAITH:
                return getRangeForFaith(column, row);

            default:
                return [];
        }

    };

    var applyMethodToEachFigureOnBoard = function (color, applyFunction) {
        if (!color) color = match.getColorOfActivePlayer();
        var result = new Array();
        for (var i = 0; i < match.size; i++) {
            for (var j = 0; j < match.size; j++) {
                var field = getField(i, j);
                var figure = field.figure;
                if (isOrigin(i, j) || !figure || figure.color != color) {
                    continue;
                }
                var list = applyFunction(i, j);
                if (list.length > 0) {
                    result.push({field: field, fields: list});
                }
            }
        }
        return result;
    };


    var getThreats = this.getThreats = function (color) {
        return applyMethodToEachFigureOnBoard(color, getThreatenPositions);
    };

    var getValidMoves = this.getValidMoves = function (color) {
        return applyMethodToEachFigureOnBoard(color, getRangeFor);
    };

    var getCapturedPieces = this.getCapturedPieces = function () {
        //TODO Erik
        return [
            {
                number: 2,
                piece: new model.Figure({color: model.Color.BLACK, type: model.FigureType.ROCKS})
            },
            {
                number: 1,
                piece: new model.Figure({color: model.Color.WHITE, type: model.FigureType.ROCKS})
            }
        ];
    };

    var getThreatenPositions = this.getThreatenPositions = function (column, row) {
        var result = [];
        var ownFigure = getFigure(column, row);
        if (!ownFigure) {
            return result;
        }

        var list = [];

        for (var i = 0; i < match.size; i++) {
            for (var j = 0; j < match.size; j++) {
                var field = getField(i, j);
                var figure = field.figure;

                if (isOrigin(i, j) || !figure || figure.color == ownFigure.color) {
                    continue;
                }

                if (figure.type == FigureType.ZENITH) { // enemy zenith
                    if (Math.abs(column - i) <= 1 && Math.abs(row - j) <= 1) {
                        result.push({column: i, row: j});
                    }
                } else { // other enemy figure
                    var list = getRangeFor(i, j);
                    list.forEach(function (element) {
                        if (element.column == column && element.row == row) {
                            result.push({column: i, row: j});
                        }
                    });
                }
            }
        }

        return result;
    };

    var getRangeForRocks = function (column, row) {
        var board = match.getCurrentSnapshot();

        var current = getFigure(column, row);

        var result = [];

        var rowTmp = row;
        if (current.color == Color.WHITE) {
            rowTmp++;
        }
        if (current.color == Color.BLACK) {
            rowTmp--;
        }

        if (isOrigin(column, rowTmp)) {
            var left = board.getField(column - 1, rowTmp).figure;
            var right = board.getField(column + 1, rowTmp).figure;

            if (!left || left.color != current.color) {
                result.push({column: column - 1, row: rowTmp});
            }

            if (!right || right.color != current.color) {
                result.push({column: column + 1, row: rowTmp});
            }

        } else {
            var figure = board.getField(column, rowTmp).figure;
            if (!figure) {
                result.push({column: column, row: rowTmp});
            }


            var leftField = board.getField(column - 1, rowTmp);
            if (leftField) {
                var left = leftField.figure;
                if (left && left.color != current.color) {
                    result.push({column: column - 1, row: rowTmp});
                }
            }


            var rightField = board.getField(column + 1, rowTmp);
            if (rightField) {
                var right = rightField.figure;
                if (right && right.color != current.color) {
                    result.push({column: column + 1, row: rowTmp});
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

            var figure = board.getField(column, rowTmp).figure;
            if (!figure) {
                result.push({column: column, row: rowTmp});
            }
        }

        return result;
    };

    var getRangeForMan = function (column, row) {
        var result = [];

        var currentFigure = getFigure(column, row);

        // the man can go one field in every diagonal direction
        var diagonalOneFieldDirections = [
            {x: 1, y: 1},
            {x: 1, y: -1},
            {x: -1, y: 1},
            {x: -1, y: -1}
        ];
        var diagonalResults = findTargets(currentFigure, column, row, diagonalOneFieldDirections);
        result = result.concat(diagonalResults);


        // the man can go on the horizontal and vertical directions.
        var straightDirections = [
            {x: -1, y: 0},
            {x: 1, y: 0},
            {x: 0, y: -1},
            {x: 0, y: 1}
        ];
        var straightResult = findTargetsInDirections(currentFigure.color, column, row, straightDirections);
        result = result.concat(straightResult);

        if (!match.historyContainsMoveToPositionWithFigureType(column,row,FigureType.MAN)) {
            var tmp = findTargetsInRange(column, row, 2);
            tmp.forEach(function(e){
                var contains = false;
                for(var i=0; i < result.length; i++){
                    if(result[i].column == e.column && result[i].row == e.row){
                        contains = true;
                        break;
                    }
                }
                if(!contains) result.push(e);
            });
        }

        return result;
    };


    var getRangeForKnight = function (column, row) {
        var result = new Array();

        var relativeTargets = [
            {column: -1, row: -2},
            {column: 1, row: -2},
            {column: -2, row: -1},
            {column: 2, row: -1},
            {column: -2, row: 1},
            {column: 2, row: 1},
            {column: -1, row: 2},
            {column: 1, row: 2}
        ];

        var currentFigure = getFigure(column, row);


        for (var i = 0; i < relativeTargets.length; i++) {
            var relativeTarget = relativeTargets[i];


            var targetColumn = column + relativeTarget.column;
            var targetRow = row + relativeTarget.row;

            if (isOutOfBoard(targetColumn, targetRow)) {
                continue;
            }

            if (isValidTarget(currentFigure, targetColumn, targetRow)) {
                result.push({column: targetColumn, row: targetRow});
            }
        }


        return result;
    };


    var getRangeForKnowledge = function (column, row) {
        var result = [];

        var currentFigure = getFigure(column, row);

        var diagonalDirections = [
            {x: 1, y: 1},
            {x: 1, y: -1},
            {x: -1, y: 1},
            {x: -1, y: -1}
        ];
        var diagonalResults = findTargetsInDirections(currentFigure.color, column, row, diagonalDirections);
        result = result.concat(diagonalResults);

        var straightDirections = [
            {x: -1, y: 0},
            {x: 1, y: 0},
            {x: 0, y: -1},
            {x: 0, y: 1}
        ];
        var straightResult = findTargetsInDirections(currentFigure.color, column, row, straightDirections);
        result = result.concat(straightResult);


        return result;
    };

    var getRangeForFaith = function (column, row) {
        return findTargetsInRange(column, row, 2);
    };

    var getRangeForWoman = function (column, row) {
        var result = [];

        var currentFigure = getFigure(column, row);

        // the woman can go one field in vertical and horizontal direction
        var straightOneFieldDirections = [
            {x: -1, y: 0},
            {x: 1, y: 0},
            {x: 0, y: -1},
            {x: 0, y: 1}
        ];
        var straightResults = findTargets(currentFigure, column, row, straightOneFieldDirections);
        result = result.concat(straightResults);

        // the woman can go on the diagonals
        var diagonalDirections = [
            {x: 1, y: 1},
            {x: 1, y: -1},
            {x: -1, y: 1},
            {x: -1, y: -1}
        ];
        var diagonalResults = findTargetsInDirections(currentFigure.color, column, row, diagonalDirections);
        result = result.concat(diagonalResults);

        return result;
    };

    var getRangeForZenith = function (column, row) {
        var result = [];

        var ownFigure = getFigure(column, row);

        var possiblePositions = [
            {x: 1, y: 1},
            {x: 1, y: -1},
            {x: -1, y: 1},
            {x: -1, y: -1},
            {x: 1, y: 0},
            {x: -1, y: 0},
            {x: 0, y: 1},
            {x: 0, y: -1}
        ];
        var tmpResult = findTargets(ownFigure, column, row, possiblePositions);

        var originCoordinate = match.size == model.BoardSize.BIG ? 4 : 3;
        if (Math.abs(column - originCoordinate) <= 1 && Math.abs(row - originCoordinate) <= 1) {
            var threatenFields = getThreatenPositions(column, row);

            if (threatenFields.length == 0) {
                result.push({column: originCoordinate, row: originCoordinate});
            }
        }

        return result.concat(tmpResult);
    };

    /**
     * Return valid Targets based on a Flood Algorithm from the current Position to <range> next Positions
     * @param column
     * @param row
     * @param range
     */

    function findTargetsInRange(column, row, range) {
        var result = [];
        var queue = [];
        var ownFigure = getFigure(column, row);
        queue.push({x: column, y: row, r: range});

        while (queue.length > 0) {

            var currentElement = queue.pop();

            if (isOutOfBoard(currentElement.x, currentElement.y)) {
                continue;
            }

            var isOwnPosition = (currentElement.x == column && currentElement.y == row);

            for (var i = 0; i < result.length; i++) {
                if (result[i].column == currentElement.x && result[i].row == currentElement.y) {
                    result.splice(i, 1);
                    break;
                }
            }

            var currentField = getField(currentElement.x, currentElement.y);

            var elementHasFigure = (currentField.figure && !isOwnPosition);

            if (elementHasFigure && currentField.figure.color == ownFigure.color) {
                continue;
            }

            if (currentElement.r > 0 && !elementHasFigure) {
                //linear
                queue.push({x: currentElement.x, y: currentElement.y + 1, r: currentElement.r - 1});
                queue.push({x: currentElement.x, y: currentElement.y - 1, r: currentElement.r - 1});
                queue.push({x: currentElement.x + 1, y: currentElement.y, r: currentElement.r - 1});
                queue.push({x: currentElement.x - 1, y: currentElement.y, r: currentElement.r - 1});
                //diagonal
                queue.push({x: currentElement.x + 1, y: currentElement.y + 1, r: currentElement.r - 1});
                queue.push({x: currentElement.x + 1, y: currentElement.y - 1, r: currentElement.r - 1});
                queue.push({x: currentElement.x - 1, y: currentElement.y + 1, r: currentElement.r - 1});
                queue.push({x: currentElement.x - 1, y: currentElement.y - 1, r: currentElement.r - 1});
            }

            if (isOwnPosition) {
                continue;
            }

            if (!isOrigin(currentElement.x, currentElement.y)) {
                result.push({column: currentElement.x, row: currentElement.y});
            }

        }
        return result;
    }

    /**
     * checks the fields based on the given column and row and the array of directions
     * whether the field is a valid target or not.
     *
     * @param currentFigure
     * @param column
     * @param row
     * @param directions
     * @returns {Array} an array of valid targets.
     */
    var findTargets = function (currentFigure, column, row, directions) {
        var result = [];

        for (var i = 0; i < directions.length; i++) {
            var direction = directions[i];

            var tmpColumn = column + direction.x;
            var tmpRow = row + direction.y;

            if (isValidTarget(currentFigure, tmpColumn, tmpRow)) {
                result.push({column: tmpColumn, row: tmpRow});
            }
        }


        return result;
    };

    /**
     * walks from the given starting point in the given direction and checks whether the fields are valid targets
     * or not. For this check the color of the current figure is needed.
     *
     * The direction is specified as an js object with an x and y value,
     * for example:
     *      direction = {x: 1, y: 0}
     *
     *
     * @param ownColor
     * @param startColumn
     * @param startRow
     * @param direction
     * @returns {Array} an array with the valid target positions.
     */
    var findTargetsInOneDirection = function (ownColor, startColumn, startRow, direction) {
        var result = new Array();

        var tmpColumn = startColumn;
        var tmpRow = startRow;

        for (var j = 0; j < match.size; j++) {
            tmpColumn = tmpColumn + direction.x;
            tmpRow = tmpRow + direction.y;

            if (isOutOfBoard(tmpColumn, tmpRow)) {
                break;
            }

            if (isOrigin(tmpColumn, tmpRow)) {
                continue;
            }

            var figure = getFigure(tmpColumn, tmpRow)

            if (figure) {
                if (figure.color != ownColor) {
                    result.push({column: tmpColumn, row: tmpRow});
                }
                break;
            } else {
                result.push({column: tmpColumn, row: tmpRow});
            }
        }

        return result;
    };

    /**
     * walks in all directions that are given by the last param.
     * See the function {@link findTargetsInOneDirection) for more details.
     *
     * @param ownColor
     * @param startColumn
     * @param startRow
     * @param directions an array of direction values
     * @returns {Array}
     */
    var findTargetsInDirections = function (ownColor, startColumn, startRow, directions) {
        var result = [];

        for (var i = 0; i < directions.length; i++) {
            var direction = directions[i];

            var partialResult = findTargetsInOneDirection(ownColor, startColumn, startRow, direction);

            result = result.concat(partialResult);
        }

        return result;
    };

    var isOrigin = this.isOrigin = function (x, y) {
        var size = match.size;

        var isBigOrigin = (size == model.BoardSize.BIG && (x == 4 && y == 4));
        var isSmallOrigin = (size == model.BoardSize.SMALL && (x == 3 && y == 3));

        return isBigOrigin || isSmallOrigin;
    };


    /**
     * Checks if the specified target is valid for the given figure.
     *
     * This check is only intended for all figures <strong>except</strong>
     * for the Zenith as this figure has lots of custom rules.
     *
     * This function returns false if the target field is out of the board OR
     * the target field is the origin OR there is an enemy figure on the target field.
     */
    var isValidTarget = function (currentFigure, targetColumn, targetRow) {

        if (isOutOfBoard(targetColumn, targetRow)) {
            return false;
        }

        if (isOrigin(targetColumn, targetRow)) {
            return false;
        }

        var targetFigure = getFigure(targetColumn, targetRow);

        return !(targetFigure && targetFigure.color == currentFigure.color);
    };


    return this;
};


