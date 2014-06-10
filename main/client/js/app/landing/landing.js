'use strict';

define(['angular'], function (angular) {

    angular.module('landing', []).
        controller('landingCtrl', ['$scope', '$http', '$location', 'endpoint',
            function ($scope, $http, $location, endpoint) {

                $scope.createNewGame = function (size) {

                    $http.post(endpoint, {size: size}).success(function (match) {
                        console.log("post successful");
                        var path = "match/" + match.matchId + "/login";
                        console.log("redirect to: " + path);
                        $location.path(path);
                    });
                }
            }]);


});