'use strict';

define(['angular'], function (angular) {

    angular.module('match', []).
        controller('matchCtrl', ['$scope', 'boardProvider', function ($scope, boardProvider) {

            $scope.boardSize = 7;
            $scope.board = [];

            var initBoard = function () {
                if ($scope.boardSize === 7) {
                    $scope.board = boardProvider.SMALL;
                } else {
                    $scope.board = boardProvider.BIG;
                }

            };

            $scope.onSelect = function (row, column) {

                for (var i in  $scope.board) {
                    if ($scope.board[i].selected) {
                        $scope.board.splice(i, 1);
                        break;
                    }
                }
                $scope.board.push({row: row, column: column, selected: true});


            };

            $scope.switchBoardSize = function () {
                $scope.boardSize = $scope.boardSize === 7 ? 9 : 7;
                initBoard();
            }

            initBoard();

        }]);


});
