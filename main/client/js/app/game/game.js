'use strict';

define(['angular', 'jquery', 'schachzwo.board.ui'], function(angular, $) {

    angular.module('game', []).
        controller('gameCtrl', ['$scope', function($scope) {

            $('#board-container').schachzwo(
                {
                    self: 'black',
                    boardSize: 9,
                    select: function (event, data) {

                        alert('row: ' + data.row + " col: " + data.col);
                    }

                });

        }]);


});
