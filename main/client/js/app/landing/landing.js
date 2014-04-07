'use strict';

define(['angular'], function(angular) {

    angular.module('landing', []).
        controller('landingCtrl', ['$scope', '$http', 'endpoint', function($scope, $http, endpoint) {

            $scope.name = '';

            $http.get(endpoint).success(function(data) {
                $scope.name = data;
            });

        }]);


});