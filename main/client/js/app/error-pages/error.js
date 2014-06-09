'use strict';

define(['angular', 'angular-translate-partial'], function(angular) {

    angular.module('error', []).
        controller('errorCtrl', ['$scope', '$translatePartialLoader', '$translate',
            function($scope, $translatePartialLoader, $translate) {

                $translatePartialLoader.addPart('error');
                $translate.refresh();

            }]);


});
