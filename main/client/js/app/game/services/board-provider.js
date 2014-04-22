'use strict';

define(['angular'], function (angular) {

    angular.module('boardProvider', []).
        factory('boardProvider', function () {

            var createBoard = function (size) {

                var fields = new Array();

                [
                    { row: 0, color: 'white' },
                    { row: size - 1, color: 'black' }
                ].forEach(function (s) {

                        fields.push({row: s.row, column: 0, figure: {color: s.color, type: 'man'}});
                        fields.push({row: s.row, column: 1, figure: {color: s.color, type: 'knight'}});
                        fields.push({row: s.row, column: 2, figure: {color: s.color, type: 'woman'}});
                        fields.push({row: s.row, column: (size - 1) / 2, figure: {color: s.color, type: 'zenith'}});
                        fields.push({row: s.row, column: size - 3, figure: {color: s.color, type: 'woman'}});
                        fields.push({row: s.row, column: size - 2, figure: {color: s.color, type: 'knight'}});
                        fields.push({row: s.row, column: size - 1, figure: {color: s.color, type: 'man'}});

                        if (size === 9) {
                            fields.push({row: s.row, column: 3, figure: {color: s.color, type: 'knowledge'}});
                            fields.push({row: s.row, column: 5, figure: {color: s.color, type: 'faith'}});
                        }
                    });


                for (var i = 0; i < size; i++) {
                    fields.push({row: 1, column: i, figure: {color: 'white', type: 'rocks'}});
                    fields.push({row: size - 2, column: i, figure: {color: 'black', type: 'rocks'}});
                }

                return fields;
            }

            return  {
                SMALL: createBoard(7),
                BIG: createBoard(9)
            };
        });
});


