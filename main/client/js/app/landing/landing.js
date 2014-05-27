'use strict';

define(['angular'], function(angular) {

    angular.module('landing', []).
        controller('landingCtrl', ['$scope', '$http', 'endpoint', "$location", function($scope, $http, endpoint, $location) {

            $scope.createNewGame = function(size){
                console.log("size:" + size);

                $http.post(endpoint, {size:size}).success(function(match) {
                    console.log("post successful");

                    console.log("match was:");
                    console.dir(match);

                    var path = "match/" + match.matchId + "/login";

                    console.log("redirect to: " + path);


                    $location.path(path);

                });
            }


        }]);


});