'use strict';

define([
    'angular',
    'jquery',
    'angular-route',
    'angular-cookies',
    'angular-growl',
    'angular-translate',
    'angular-translate-partial'], function (angular, $) {

    angular.module('schachzwoApp', [
        'ngRoute',
        'ngCookies',
        'angular-growl',
        'pascalprecht.translate',
        'match',
        'landing',
        'login',
        'schachzwoBoard',
        'sse',
        'matchLink',
        'endMessages',
        'error']).
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
                    templateUrl: 'js/app/error-pages/404.html',
                    controller: 'errorCtrl'
                });

            $routeProvider.when('/500',
                {
                    templateUrl: 'js/app/error-pages/500.html',
                    controller: 'errorCtrl'
                });

            $routeProvider.otherwise({redirectTo: '/'});

        }]).
        config(['$translateProvider', '$translatePartialLoaderProvider', function ($translateProvider, $translatePartialLoaderProvider) {

            $translatePartialLoaderProvider.addPart('index');

            $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: '/i18n/{part}/{lang}.json'
            });

            $translateProvider.determinePreferredLanguage();

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
                        modal.modal('hide');
                        modal.modal('hide');
                        $('body').removeClass('modal-open');
                        $('.modal-backdrop').remove();
                    }
                });

            } ]);

});
