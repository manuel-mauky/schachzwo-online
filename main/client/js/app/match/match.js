'use strict';

define(['angular'], function (angular) {

    angular.module('match', []).
        controller('matchCtrl', ['$scope', '$routeParams', '$http', 'boardProvider', function ($scope, $routeParams, $http, boardProvider) {

            $scope.boardSize = 7;
            $scope.ownColor = 'black';
            $scope.board = [];

            var matchId = $routeParams.matchId;

            $scope.matchLink = "http://localhost:1337/match/" + matchId;

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

            initBoard();
            if (!!window.EventSource) {
                console.log("create sse event source");
                // connect to the SSE
                var source = new EventSource("http://localhost:1337/matches/" + matchId);

                console.log("sse event source created:" + source);

                source.addEventListener("update", function (event) {
                    console.log("update received");
                    console.dir(event);

                }, false);

            } else {
                console.log("Can't use SSE because Browser doesn't support EventSource");
            }
        }]);


});
