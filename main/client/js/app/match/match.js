'use strict';

define(['angular', 'jquery'], function (angular, $) {

    angular.module('match', []).
        controller('matchCtrl', ['$scope', '$routeParams', '$http', 'endpoint', 'sse', 'matchLink',
            function ($scope, $routeParams, $http, endpoint, sse, matchLink) {

                var matchId = $routeParams.matchId;
                var selectedField = {};
                var validMoves = [];
                var move;

                $scope.matchLink = matchLink(matchId);
                $scope.match = {size: 7, state: 'preparing'};
                $scope.self = {color: 'black'};
                $scope.board = [];
                $scope.moves = [];
                $scope.itsMyTurn = false;
                $scope.onlooker = false;
                $scope.availablePieces = [];


                sse(matchId).addEventListener("message", function (event) {
                    console.log(event.data);

                    if (event.data == "update") {
                        clearSelections();
                        update();
                    }
                    if (event.data == "match-started") {
                        initMatch();
                    }

                }, false);


                $scope.onSelect = function (row, column) {
                    if (!$scope.itsMyTurn || $scope.match.state != 'playing') {
                        return;
                    }

                    var field = getField(row, column);

                    if (field && field.figure && field.figure.color == $scope.self.color) {
                        clearSelections(true);
                        selectedField = field;
                        $scope.board.push({position: {row: row, column: column}, selected: true});

                        getValidMoves(field).forEach(function (pos) {
                            $scope.board.push({position: {row: pos.row, column: pos.column}, accessible: true});
                        });


                    } else if (selectedField) {

                        getValidMoves(selectedField).forEach(function (pos) {

                            if (field && pos.row == field.position.row && pos.column == field.position.column) {

                                move = {
                                    figure: selectedField.figure,
                                    from: selectedField.position,
                                    to: field.position
                                };

                                if (isPromotionPossible(move)) {
                                    $('#promotion-modal').modal('show');
                                } else {
                                   postMove();
                                }
                                return;
                            }
                        });
                    }
                };


                $scope.promoteRocks = function(piece) {
                    if (move) {
                        move.figure = piece;
                        postMove();
                        $('#promotion-modal').modal('hide');
                    }
                };

                $scope.draw = function (action) {
                    $http.put(endpoint + "/" + matchId + "/draw", {draw: action });
                };

                var initMatch = function () {

                    $http.get(endpoint + "/" + matchId).success(function (match) {
                        $scope.match = match;

                        $http.get(endpoint + "/" + matchId + "/self").success(function (player) {
                            $scope.self = player;
                            update();
                        }).error(function () {
                            $scope.onlooker = true;
                            update();
                        });
                    });

                };


                var update = function () {

                    move = null;

                    $http.get(endpoint + "/" + matchId + "/board").success(function (board) {

                        $scope.board = board;

                        $http.get(endpoint + "/" + matchId + "/moves").success(function (moves) {
                            $scope.moves = moves;
                            $scope.itsMyTurn = !$scope.onlooker && (moves.length + ($scope.self.color == 'white' ? 1 : 0)) % 2 == 0;
                            markThreateningFields();
                        });

                        $http.get(endpoint + "/" + matchId + "/valid-moves").success(function (moves) {
                            validMoves = moves;
                        });

                        $http.get(endpoint + "/" + matchId + "/captured-pieces").success(function (pieces) {

                            $scope.availablePieces = pieces.filter(function (entry) {
                                return entry.number > 0 && entry.piece && entry.piece.color == $scope.self.color;
                            }).map(function (entry) {
                                return entry.piece;
                            });

                        });

                    });
                };

                var postMove = function() {
                    if (move) {
                        $http.post(endpoint + "/" + matchId + "/moves", move).success(function () {
                            $scope.itsMyTurn = false;
                            update();
                        });
                    }
                };

                var clearSelections = function (onlyOwnSelections) {
                    selectedField = {};
                    $scope.board = $scope.board.filter(function (field) {
                        return !field.selected && !field.accessible && (onlyOwnSelections || !field.threatening);

                    });
                };

                var getField = function (row, column) {
                    for (var i in $scope.board) {
                        var field = $scope.board[i];
                        if (field.position.row === row && field.position.column === column) {
                            return field;
                        }
                    }
                };

                var getOwnZenith = function () {
                    for (var i in $scope.board) {
                        var field = $scope.board[i];
                        if (field.figure.color == $scope.self.color && field.figure.type == "zenith") {
                            return field;
                        }
                    }
                };

                var getValidMoves = function (field) {

                    for (var i in validMoves) {
                        var entry = validMoves[i]
                        if (entry.field.position.row == field.position.row && entry.field.position.column == field.position.column) {
                            return entry.fields;
                        }
                    }
                    return [];
                };


                var markThreateningFields = function () {
                    if (!$scope.itsMyTurn) {
                        return;
                    }
                    var ownZenith = getOwnZenith();
                    if (ownZenith) {

                        $http.get(endpoint + "/" + matchId + "/threats").success(function (threats) {

                            for (var i in threats) {
                                var entry = threats[i];

                                if (entry.field.position.row == ownZenith.position.row && entry.field.position.column == ownZenith.position.column) {
                                    entry.fields.forEach(function (pos) {

                                        $scope.board.push({position: {row: pos.row, column: pos.column}, threatening: true});

                                    });
                                    return;
                                }
                            }
                        });
                    }
                };

                var isPromotionPossible = function (move) {
                    if (move.figure.type != "rocks") {
                        return false;
                    }
                    var lastRow = $scope.self.color == 'white' ? $scope.match.size - 1 : 0;
                    var lastButOneRow = $scope.self.color == 'white' ? $scope.match.size - 2 : 1;

                    return move.from.row == lastButOneRow && move.to.row == lastRow;
                };

                initMatch();

            }]);


});
