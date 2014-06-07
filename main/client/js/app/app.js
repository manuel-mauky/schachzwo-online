'use strict';

define([
    'angular',
    'jquery',
    'angular-route',
    'angular-cookies',
    'angular-growl'], function (angular, $) {

    angular.module('schachzwoApp', [
        'ngRoute',
        'ngCookies',
        'angular-growl',
        'match',
        'landing',
        'login',
        'schachzwoBoard',
        'sse',
        'matchLink',
        'endMessages']).
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

            $routeProvider.when('/about',
                {
                    templateUrl: 'js/app/about/about.html'
                });

            $routeProvider.when('/404',
                {
                    templateUrl: 'js/app/error-pages/404.html'
                });

            $routeProvider.when('/500',
                {
                    templateUrl: 'js/app/error-pages/500.html'
                });

            $routeProvider.otherwise({redirectTo: '/'});

        }]).
        config(['growlProvider', function (growlProvider) {
            growlProvider.globalTimeToLive(5000);
        }]).
        value('version', '0.1').
        value('endpoint', '../matches').
        controller('appCtrl', ['$scope', 'version',
            function ($scope, version) {
                $scope.version = version;

                $scope.$on('$routeChangeStart', function () {

                    //Close Bootstrap Modals
                    var modal = $(".modal");
                    if (typeof modal.modal === 'function') {
                        console.log('bootstrap close modals');
                        modal.modal('hide');
                        modal.modal('hide');
                        $('body').removeClass('modal-open');
                        $('.modal-backdrop').remove();
                    }
                });

            } ]);

});
