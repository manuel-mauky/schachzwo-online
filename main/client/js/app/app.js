'use strict';

define([
    'angular',
    'angular-route',
    'angular-growl'], function (angular) {

    angular.module('schachzwoApp', [
        'ngRoute',
        'angular-growl',
        'match',
        'landing',
        'login',
        'schachzwoBoard',
        'sse',
        'matchLink']).
        config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when("/match/:matchId/login",
                {
                    templateUrl: "js/app/login/login.html",
                    controller: "loginCtrl"
                });

            $routeProvider.when('/match/:matchId',
                {
                    templateUrl: 'js/app/match/match.html',
                    controller: 'matchCtrl'
                });

            $routeProvider.when('/',
                {
                    templateUrl: 'js/app/landing/landing.html',
                    controller: 'landingCtrl'
                });

            $routeProvider.otherwise({redirectTo: '/'});

        }]).
        config(['growlProvider', function(growlProvider) {
            growlProvider.globalTimeToLive(5000);
        }]).
        value('version', '0.1').
        value('endpoint', '../matches').
        controller('appCtrl', ['$scope', 'version',
            function ($scope, version) {
                $scope.version = version;
            } ]);

});
