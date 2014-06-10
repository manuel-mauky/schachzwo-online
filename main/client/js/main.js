'use strict';

requirejs.config({
    paths: {

        //AngularJS
        angular: 'libs/angular/angular.min',
        'angular-route': 'libs/angular/angular-route.min',
        'angular-growl': 'libs/angular/angular-growl.min',
        'angular-cookies': 'libs/angular/angular-cookies.min',
        'angular-translate': 'libs/angular/angular-translate.min',
        'angular-translate-partial': 'libs/angular/angular-translate-loader-partial.min',

        //jQuery
        jquery: 'libs/jquery/jquery-2.1.0.min',
        'jquery-ui': 'libs/jquery/jquery-ui.min',
        'jquery-validate': 'libs/jquery/jquery.validate.min',
        'schachzwo-board.ui': 'app/match/directives/schachzwo-board.ui',

        //other
        bootstrap: 'libs/bootstrap.min',
        domReady: 'libs/require/domReady',
        eventsource: 'libs/eventsource'
    },

    shim: {
        angular: {
            exports: 'angular'
        },
        'angular-route': ['angular'],
        'angular-growl': ['angular'],
        'angular-cookies': ['angular'],
        'angular-translate': ['angular'],
        'angular-translate-partial': ['angular', 'angular-translate'],
        bootstrap: ['jquery'],
        'jquery-validate': ['jquery'],
        'jquery-ui': ['jquery'],
        'schachzwo-board.ui': ['jquery-ui']
    }
});

// bootstrapping app
require([
        'angular',
        'bootstrap',
        'app/app',
        'app/landing/landing',
        'app/match/match',
        'app/login/login',
        'app/match/directives/schachzwo-board',
        'app/match/services/sse',
        'app/match/services/match-link'],
    function (angular) {
        require(['domReady!'], function (document) {

            angular.bootstrap(document, ['schachzwoApp']);

        });
    });
