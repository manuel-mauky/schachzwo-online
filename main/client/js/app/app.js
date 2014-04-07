'use strict';

define([
    'require',
    'angular',
    'angularRoute'], function (require, angular) {
    require(['domReady!'], function (document) {

        angular.module('schachzwoApp', [
                'ngRoute',
                'game',
                'landing']).
            config(['$routeProvider', function ($routeProvider) {

                $routeProvider.when('/game',
                    {
                        templateUrl: 'js/app/game/game.html',
                        controller: 'gameCtrl'
                    });

                $routeProvider.when('/',
                    {
                        templateUrl: 'js/app/landing/landing.html',
                        controller: 'landingCtrl'
                    });


                $routeProvider.otherwise({redirectTo: '/'});

            }]).
            value('version', '0.1').
            value('endpoint', '../board').
            controller('appCtrl', ['$scope', 'version',
                function ($scope, version) {
                    $scope.version = version;
                } ]);

        angular.bootstrap(document, ['schachzwoApp']);

    });
});
