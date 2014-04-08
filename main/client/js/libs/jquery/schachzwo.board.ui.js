(function ($) {

    var Color = {
        BLACK: "black",
        WHITE: "white"
    };


    $.widget('custom.schachzwo', {

        options: {

            boardSize: 9,
            self: Color.BLACK,
            boardBorderColor: "#ED8641",
            boardBlackFieldColor: "#BE5003",
            boardWhiteFieldColor: "#F8D48A",
            boardSelectedFieldColor: "rgba(61,158,255,0.8)",
            boardAccessibleFieldColor: "rgba(60,255,60,0.6)",
            figureBlackColor: "#000000",
            figureWhiteColor: "#FFFFFF",
            figureBlackBorderColor: "gray",
            figureWhiteBorderColor: "#000000"

        },

        _create: function () {
            this.canvas = $('<canvas>');
            this.element.append(this.canvas);
            this.canvasContext = this.canvas.get(0).getContext('2d');

            this._on(this.window, {'resize': function () {
                this._respond();
            }});

            this._on(this.canvas, {'click': function (e) {

                var x = e.pageX - this.canvas.offset().left - this.x0;
                var y = e.pageY - this.canvas.offset().top - this.y0;

                if (x >= 0 && x <= this.fieldSize * this.options.boardSize &&
                    y >= 0 && y <= this.fieldSize * this.options.boardSize) {

                    var col = Math.floor(x / this.fieldSize);
                    var row = Math.floor(y / this.fieldSize);
                    this._trigger("onSelect", null, { col: col, row: row });

                }
            }});


            this._respond();
        },

        show: function (fields) {
            this.fields = fields;
            var width = this.canvas.attr('width');
            var height = this.canvas.attr('height');
            this._draw(width, height);
        },

        _respond: function () {

            var container = this.canvas.parent();

            var width = container.width();
            var height = container.height() * .9;
            this.canvas.attr('width', width);
            this.canvas.attr('height', height);

            this._draw(width, height);
        },

        _checkColor: function (color) {
            if (color !== Color.BLACK && color !== Color.WHITE) {
                throw "Invalid color, it should be 'black' or 'white'.";
            }
        },

        _checkColRow: function (val) {
            if (val < 0 || val >= this.options.boardSize) {
                throw "Invalid value, it can only be a number between 0 and " + this.options.boardSize + ".";
            }
        },

        _checkBoardSize: function (boardSize) {
            if (boardSize != 7 && boardSize != 9) {
                throw "Invalid board size, it should be 7 or 9.";
            }
        },

        _draw: function (width, height) {

            var context = this.canvasContext;
            var boardSize = this.options.boardSize;
            var self = this.options.self;
            var boardBorderColor = this.options.boardBorderColor;
            var boardBlackFieldColor = this.options.boardBlackFieldColor;
            var boardWhiteFieldColor = this.options.boardWhiteFieldColor;
            var boardSelectedFieldColor = this.options.boardSelectedFieldColor;
            var boardAccessibleFieldColor = this.options.boardAccessibleFieldColor;
            var figureBlackColor = this.options.figureBlackColor;
            var figureWhiteColor = this.options.figureWhiteColor;
            var figureBlackBorderColor = this.options.figureBlackBorderColor;
            var figureWhiteBorderColor = this.options.figureWhiteBorderColor;

            this._checkBoardSize(boardSize);

            var boardWidth = Math.min(width, height);
            var border = (3 / 100) * boardWidth;
            boardWidth -= 2 * border;

            var x0 = (width - boardWidth) / 2;
            var y0 = border;
            var fieldSize = boardWidth / boardSize;

            this.x0 = x0;
            this.y0 = y0;
            this.fieldSize = fieldSize;

            var rect = function (x, y, w, h) {
                context.beginPath();
                context.rect(x, y, w, h);
                context.closePath();
                context.fill();
            };

            var fillFloor = function (row, col, color) {
                context.fillStyle = color;
                rect(x0 + col * fieldSize, y0 + row * fieldSize, fieldSize, fieldSize);
            };

            var drawFloor = function (row, col) {
                fillFloor(row, col, (row * boardSize + col) % 2 === 0 ? boardWhiteFieldColor : boardBlackFieldColor);
            };


            var drawFigure = function (row, col, figure) {

                var fillFigure = function (color) {
                    context.fillStyle = color === Color.WHITE ? figureWhiteColor : figureBlackColor;
                    context.fill();
                    context.lineWidth = 1 / 30 * fieldSize;
                    context.strokeStyle = color === Color.WHITE ? figureWhiteBorderColor : figureBlackBorderColor;
                    context.stroke();
                };

                var figures = {

                    rocks: function (row, col, color) {
                        context.beginPath();
                        context.rect(x0 + (col + (11 / 28)) * fieldSize, y0 + (row + (2 / 7)) * fieldSize, (3 / 14) * fieldSize, (3 / 7) * fieldSize);
                        fillFigure(color);

                    },

                    man: function (row, col, color) {
                        context.beginPath();
                        context.rect(x0 + (col + (1 / 4)) * fieldSize, y0 + (row + (1 / 4)) * fieldSize, (1 / 2) * fieldSize, (1 / 2) * fieldSize);
                        fillFigure(color);
                    },

                    woman: function (row, col, color) {
                        context.beginPath();
                        context.arc(x0 + (col + (1 / 2)) * fieldSize, y0 + (row + (1 / 2)) * fieldSize, Math.sqrt(1 / (4 * Math.PI)) * fieldSize, 0, 2 * Math.PI, false);
                        fillFigure(color);
                    },

                    knight: function (row, col, color) {
                        context.beginPath();
                        context.moveTo(x0 + (col + (29 / 140)) * fieldSize, y0 + (row + (3 / 4)) * fieldSize);
                        context.lineTo(x0 + (col + (111 / 140)) * fieldSize, y0 + (row + (3 / 4)) * fieldSize);
                        context.lineTo(x0 + (col + (111 / 140)) * fieldSize, y0 + (row + (19 / 28)) * fieldSize);
                        context.lineTo(x0 + (col + (1 / 2)) * fieldSize, y0 + (row + (37 / 140)) * fieldSize);
                        context.lineTo(x0 + (col + (29 / 140)) * fieldSize, y0 + (row + (19 / 28)) * fieldSize);
                        context.lineTo(x0 + (col + (29 / 140)) * fieldSize, y0 + (row + (3 / 4)) * fieldSize);
                        context.closePath();
                        fillFigure(color);
                    },

                    knowledge: function (row, col, color) {
                        context.beginPath();
                        context.moveTo(x0 + (col + (1 / 5)) * fieldSize, y0 + (row + (4 / 5)) * fieldSize);
                        context.lineTo(x0 + (col + (4 / 5)) * fieldSize, y0 + (row + (4 / 5)) * fieldSize);
                        context.lineTo(x0 + (col + (4 / 5)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (col + (9 / 14)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (col + (5 / 7)) * fieldSize, y0 + (row + (1 / 5)) * fieldSize);
                        context.lineTo(x0 + (col + (2 / 7)) * fieldSize, y0 + (row + (1 / 5)) * fieldSize);
                        context.lineTo(x0 + (col + (5 / 14)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (col + (1 / 5)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (col + (1 / 5)) * fieldSize, y0 + (row + (4 / 5)) * fieldSize);
                        context.closePath();
                        fillFigure(color);
                    },

                    faith: function (row, col, color) {
                        context.beginPath();
                        context.moveTo(x0 + (col + (1 / 5)) * fieldSize, y0 + (row + (4 / 5)) * fieldSize);
                        context.lineTo(x0 + (col + (4 / 5)) * fieldSize, y0 + (row + (4 / 5)) * fieldSize);
                        context.lineTo(x0 + (col + (4 / 5)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (col + (5 / 7)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (col + (9 / 14)) * fieldSize, y0 + (row + (1 / 5)) * fieldSize);
                        context.lineTo(x0 + (col + (5 / 14)) * fieldSize, y0 + (row + (1 / 5)) * fieldSize);
                        context.lineTo(x0 + (col + (2 / 7)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (col + (1 / 5)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (col + (1 / 5)) * fieldSize, y0 + (row + (4 / 5)) * fieldSize);
                        context.closePath();
                        fillFigure(color);
                    },

                    zenith: function (row, col, color) {
                        var zenithY = self === color ? (5 / 14) : (9 / 14);

                        if (row === (boardSize - 1) / 2 && col === (boardSize - 1) / 2)
                            zenithY = 1 / 2;

                        context.beginPath();
                        context.arc(x0 + (col + (1 / 2)) * fieldSize, y0 + (row + zenithY) * fieldSize, (3 / 7) * fieldSize, 0, Math.PI, self !== color);
                        context.closePath();
                        fillFigure(color);
                        context.beginPath();
                        context.arc(x0 + (col + (1 / 2)) * fieldSize, y0 + (row + zenithY) * fieldSize, (3 / 14) * fieldSize, 0, Math.PI, self !== color);
                        context.closePath();
                        context.fillStyle = color === Color.BLACK ? figureWhiteColor : figureBlackColor;
                        context.fill();
                    }

                };

                figures[figure.name](row, col, figure.color);

            };


            var drawBoard = function () {

                var drawCenter = function () {
                    context.beginPath();
                    context.arc(x0 + ((boardSize - 1) / 2 + 1 / 2) * fieldSize, y0 + ((boardSize - 1) / 2 + 1 / 2) * fieldSize, (4 / 14) * fieldSize, 0, 2 * Math.PI, true);
                    context.closePath();
                    context.lineWidth = 2 / 30 * fieldSize;
                    context.strokeStyle = boardBorderColor;
                    context.stroke();
                };

                context.fillStyle = boardBorderColor;
                rect(x0 - border, y0 - border, boardWidth + 2 * border, boardWidth + 2 * border);

                for (var row = 0; row < boardSize; row++) {
                    for (var col = 0; col < boardSize; col++) {
                        drawFloor(row, col);
                    }
                }

                drawCenter();
            }();

            for (var i in this.fields) {
                var field = this.fields[i];

                this._checkColRow(field.row);
                this._checkColRow(field.col);

                if (field.accessible) {
                    fillFloor(field.row, field.col, boardAccessibleFieldColor);
                }
                if (field.selected) {
                    fillFloor(field.row, field.col, boardSelectedFieldColor);
                }

            }

            for (var i in this.fields) {
                var field = this.fields[i];
                if (field.figure) {
                    this._checkColor(field.figure.color);
                    drawFigure(field.row, field.col, field.figure);
                }
            }

        }

    });

}(jQuery));
