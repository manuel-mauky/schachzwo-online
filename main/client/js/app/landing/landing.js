'use strict';

define(['angular', 'angular-translate-partial'], function(angular) {

    angular.module('landing', []).
        controller('landingCtrl', ['$scope', '$http', '$translatePartialLoader', '$translate', 'endpoint', "$location",
            function($scope, $http, $translatePartialLoader, $translate, endpoint, $location) {

            $translatePartialLoader.addPart('landing');
            $translate.refresh();

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