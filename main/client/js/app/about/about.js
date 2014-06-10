'use strict';

define(['angular', 'angular-translate-partial'], function(angular) {

    angular.module('about', []).
        controller('aboutCtrl', ['$scope', '$translatePartialLoader', '$translate',
            function($scope, $translatePartialLoader, $translate) {

                $translatePartialLoader.addPart('about');
                $translate.refresh();

            }]);


});