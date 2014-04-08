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

                        fields.push({row: s.row, col: 0, figure: {color: s.color, name: 'man'}});
                        fields.push({row: s.row, col: 1, figure: {color: s.color, name: 'knight'}});
                        fields.push({row: s.row, col: 2, figure: {color: s.color, name: 'woman'}});
                        fields.push({row: s.row, col: (size - 1) / 2, figure: {color: s.color, name: 'zenith'}});
                        fields.push({row: s.row, col: size - 3, figure: {color: s.color, name: 'woman'}});
                        fields.push({row: s.row, col: size - 2, figure: {color: s.color, name: 'knight'}});
                        fields.push({row: s.row, col: size - 1, figure: {color: s.color, name: 'man'}});

                        if (size === 9) {
                            fields.push({row: s.row, col: 3, figure: {color: s.color, name: 'knowledge'}});
                            fields.push({row: s.row, col: 5, figure: {color: s.color, name: 'faith'}});
                        }
                    });


                for (var i = 0; i < size; i++) {
                    fields.push({row: 1, col: i, figure: {color: 'white', name: 'rocks'}});
                    fields.push({row: size - 2, col: i, figure: {color: 'black', name: 'rocks'}});
                }

                return fields;
            }

            return  {
                SMALL: createBoard(7),
                BIG: createBoard(9)
            };
        });
});


