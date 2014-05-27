'use strict';

define(['angular', 'eventsource'], function (angular) {

    angular.module('sse', []).
        factory('sse', ['endpoint', function (endpoint) {

            return function(matchId) {

                return new EventSource(endpoint + "/" + matchId + "/event-stream");
            };
        }]);
});



