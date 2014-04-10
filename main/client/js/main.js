'use strict';

requirejs.config({
    paths: {

        //AngularJS
        angular: 'libs/angular/angular.min',
        'angular-route': 'libs/angular/angular-route.min',

        //jQuery
        jquery: 'libs/jquery/jquery-2.1.0.min',
        'jquery-ui': 'libs/jquery/jquery-ui.min',
        'schachzwo-board.ui': 'app/game/directives/schachzwo-board.ui',

        //other
        bootstrap: 'libs/bootstrap.min',
        domReady: 'libs/require/domReady'

    },

    shim: {
        angular: {
            exports: 'angular'
        },
        'angular-route': ['angular'],
        bootstrap: ['jquery'],
        'jquery-ui': ['jquery'],
        'schachzwo-board.ui': ['jquery-ui']
    }
});

// bootstrapping app
require([
        'angular',
        'app/app',
        'app/landing/landing',
        'app/game/game',
        'app/game/directives/schachzwo-board',
        'app/game/services/board-provider'],
    function (angular) {
        require(['domReady!'], function (document) {

           angular.bootstrap(document, ['schachzwoApp']);

        });
    });
