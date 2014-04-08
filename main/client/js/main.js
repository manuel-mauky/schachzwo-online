'use strict';

requirejs.config({
    paths: {

        'app.main': 'app/app',
        'app.landing': 'app/landing/landing',
        'app.game': 'app/game/game',
        'directives.schachzwoBoard': 'app/common/directives/schachzwo-board',
        'services.boardProvider': 'app/common/services/board-provider',

        //AngularJS
        angular: 'libs/angular/angular.min',
        angularRoute: 'libs/angular/angular-route.min',

        //jQuery
        jquery: 'libs/jquery/jquery-2.1.0.min',
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
        'jquery.ui':  ['jquery'],
        'schachzwo.board.ui': ['jquery.ui']
    }
});

// starting app
require(['app.main']);
