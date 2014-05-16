'use strict';

define(['angular'], function (angular) {
    angular.module("login", [])
        .controller("loginCtrl", ["$scope", "$http", "endpoint", function($scope, $http, endpoint){

            console.log("login Ctrl")


        }]);

});
