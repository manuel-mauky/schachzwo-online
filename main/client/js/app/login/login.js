'use strict';

define(['angular'], function (angular) {
    angular.module("login", [])
        .controller("loginCtrl", ["$scope", "$http", "$routeParams", "endpoint", "$location",
            function ($scope, $http, $routeParams, endpoint, $location) {

                console.log("login Ctrl");

                $scope.playerName = "Dein Name";


                $scope.login = function () {

                    var matchId = $routeParams.matchId;

                    console.log("login : " + matchId);

                    $http.post(endpoint + "/" + matchId + "/login", {name: $scope.playerName})
                        .success(function (player) {
                            console.log("success:");
                            console.dir(player);

                            var path = "match/" + matchId;
                            console.log("redirect to: " + path);

                            $location.path(path);

                        })
                        .error(function (data, status, headers, config) {
                            console.log("error:" + status);

                        });

                };


            }]);

});
