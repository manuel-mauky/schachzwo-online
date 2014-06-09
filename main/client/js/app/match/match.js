'use strict';

define(['angular', 'jquery', 'angular-growl'], function (angular, $) {

    angular.module('match', []).
        controller('matchCtrl', ['$scope', '$routeParams', '$http', '$location', 'growl', 'endpoint', 'sse', 'matchLink', 'endMessages',
            function ($scope, $routeParams, $http, $location, growl, endpoint, sse, matchLink, endMessages) {

                var matchId = $routeParams.matchId;
                var selectedField = {};
                var validMoves = [];
                var currentMove;

                $scope.matchLink = matchLink(matchId);
                $scope.match = {size: 7, state: 'preparing'};
                $scope.self = {color: 'black'};
                $scope.board = [];
                $scope.moves = [];
                $scope.itsMyTurn = false;
                $scope.onlooker = false;
                $scope.check = false;
                $scope.availablePieces = [];

                sse(matchId).addEventListener("message", function (event) {
                    console.log(event.data);

                    if (event.data == "update" || event.data == "draw-rejected") {
                        clearSelections();
                        update();
                    }
                    if (event.data == "match-started") {
                        growl.addSuccessMessage("Die Partie kann beginnen");
                        $('#link-modal').modal('hide');
                        initMatch();
                    }
                    if (event.data == "draw-offered") {
                        $('#draw-modal').modal('show');
                    }

                    if (event.data == "draw-accepted" || event.data == "stale-mate" ||
                        event.data.indexOf("lost") == 0 || event.data.indexOf("won") == 0) {
                        $scope.itsMyTurn = false;
                        $scope.endCause = event.data == "draw-accepted" ? "draw" : event.data;
                        $scope.$apply();
                        initMatch();
                        $('#end-modal').modal('show');
                    }

                    if (event.data == "draw-rejected") {
                        growl.addWarnMessage("Remis wurde abgelehnt");
                    }

                    if (event.data == "check") {
                        $scope.check = true;
                        growl.addWarnMessage("Du stehst im Schach!");
                    }

                }, false);


                $scope.onSelect = function (row, column) {
                    if (!$scope.itsMyTurn || $scope.match.state != 'playing' || $scope.drawOffered) {
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

                                currentMove = {
                                    figure: selectedField.figure,
                                    from: selectedField.position,
                                    to: field.position
                                };

                                if (isPromotionPossible(currentMove)) {
                                    $('#promotion-modal').modal('show');
                                } else {
                                    postMove();
                                }
                                return;
                            }
                        });
                    }
                };

                $scope.promoteRocks = function (piece) {
                    if (currentMove) {
                        currentMove.figure = piece;
                        postMove();
                        $('#promotion-modal').modal('hide');
                    }
                };

                $scope.offerDraw = function () {
                    $http.put(endpoint + "/" + matchId + "/draw", {draw: "offered" }).success(function () {
                        $scope.itsMyTurn = false;
                        clearSelections();
                    });
                };

                $scope.rejectDraw = function () {
                    $http.put(endpoint + "/" + matchId + "/draw", {draw: "rejected" }).success(function () {
                        $('#draw-modal').modal('hide');
                    });
                };

                $scope.acceptDraw = function () {
                    $http.put(endpoint + "/" + matchId + "/draw", {draw: "accepted" }).success(function () {
                        $('#draw-modal').modal('hide');
                        $scope.endCause = "draw";
                        $scope.$apply();
                        $('#end-modal').modal('show');
                    });
                };

                $scope.surrender = function () {
                    if ($scope.itsMyTurn) {
                        var ownZenith = getOwnZenith();
                        postMove({
                            figure: ownZenith.figure,
                            from: ownZenith.position,
                            to: getOrigin()
                        });
                    }
                };

                $scope.getBottomPlayerName = function () {
                    try {
                        return $scope.self.color === 'black' ? $scope.match.playerBlack.name : $scope.match.playerWhite.name;
                    } catch (e) {
                        return $scope.onlooker ? "Schwarzer Spieler" : "Du";
                    }
                };

                $scope.getTopPlayerName = function () {
                    try {
                        return $scope.self.color === 'black' ? $scope.match.playerWhite.name : $scope.match.playerBlack.name;
                    } catch (e) {
                        return $scope.onlooker ? "Weißer Spieler" : "Dein Gegner";
                    }
                };

                $scope.isItTopPlayersTurn = function () {
                    return $scope.match.state == "playing" && !$scope.isItBottomPlayersTurn();
                };

                $scope.isItBottomPlayersTurn = function () {
                    return $scope.match.state == "playing" && ($scope.moves.length + ($scope.self.color == 'white' ? 1 : 0)) % 2 == 0;
                };

                $scope.getEndMessage = function () {
                    return endMessages($scope.endCause);
                };

                var initMatch = function () {

                    $http.get(endpoint + "/" + matchId).success(function (match) {
                        $scope.match = match;

                        $http.get(endpoint + "/" + matchId + "/self").success(function (player) {
                            $scope.self = player;
                            if (player.color === "black" && !match.playerWhite) {
                                $('#link-modal').modal('show');
                            }
                            update();
                        }).error(function () {
                            if (match.playerWhite) {
                                $scope.onlooker = true;
                                update();
                            } else {
                                window.location = matchLink(matchId);
                            }
                        });
                    }).error(function () {
                        $location.path("/404");
                    });

                };

                var update = function () {

                    $http.get(endpoint + "/" + matchId).success(function (match) {
                        $scope.match = match;

                        currentMove = null;
                        $http.get(endpoint + "/" + matchId + "/board").success(function (board) {

                            $scope.board = board;
                            $http.get(endpoint + "/" + matchId + "/moves").success(function (moves) {
                                $scope.moves = moves;
                                $scope.itsMyTurn = !$scope.onlooker
                                    && $scope.match.state == 'playing'
                                    && (moves.length + ($scope.self.color == 'white' ? 1 : 0)) % 2 == 0;
                                markThreateningFields();
                            });

                            $http.get(endpoint + "/" + matchId + "/valid-moves").success(function (moves) {
                                validMoves = moves;
                            });

                            $http.get(endpoint + "/" + matchId + "/captured-pieces").success(function (pieces) {

                                $scope.availablePieces = pieces.filter(function (entry) {
                                    return entry.number > 0 &&
                                        entry.piece &&
                                        entry.piece.color == $scope.self.color &&
                                        entry.piece.type != "rocks";
                                }).map(function (entry) {
                                    return entry.piece;
                                });

                            });

                        });

                    });
                };

                var postMove = function (move) {
                    if (move || currentMove) {
                        $http.post(endpoint + "/" + matchId + "/moves", move || currentMove).success(function () {
                            $scope.itsMyTurn = false;
                            $scope.check = false;
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
                    if (field && field.position) {
                        for (var i in validMoves) {
                            var entry = validMoves[i];
                            if (entry.field.position.row == field.position.row && entry.field.position.column == field.position.column) {
                                return entry.fields;
                            }
                        }
                    }
                    return [];
                };

                var getOrigin = function () {
                    if ($scope.match.size == 7) {
                        return {row: 3, column: 3};
                    } else {
                        return {row: 4, column: 4};
                    }
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
                    if (move.figure.type != "rocks" || $scope.availablePieces.length == 0) {
                        return false;
                    }
                    var lastRow = $scope.self.color == 'white' ? $scope.match.size - 1 : 0;
                    var lastButOneRow = $scope.self.color == 'white' ? $scope.match.size - 2 : 1;

                    return move.from.row == lastButOneRow && move.to.row == lastRow;
                };

                initMatch();

            }]);

});
