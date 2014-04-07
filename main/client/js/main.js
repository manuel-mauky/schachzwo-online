'use strict';

requirejs.config({
    paths: {

        app: 'app/app',
        'app.landing': 'app/landing/landing',
        'app.game': 'app/game/game',

        //AngularJS
        angular: 'libs/angular/angular.min',
        angularRoute: 'libs/angular/angular-route.min',

        //jQuery
        jquery: 'https://code.jquery.com/jquery-2.1.0.min',
        'jquery.ui': 'libs/jquery/jquery-ui.min',
        'schachzwo.board.ui': 'libs/jquery/schachzwo.board.ui',

        //others
        bootstrap: 'libs/bootstrap.min',
        domReady: 'libs/require/domReady'

    },

    shim: {
        angular: {
            exports: 'angular'
        },
        angularRoute: ['angular'],
        bootstrap: ['jquery'],
        'schachzwo.board.ui': ['jquery', 'jquery.ui']
    }
});

// starting app
require(['app', 'app.landing', 'app.game']);
