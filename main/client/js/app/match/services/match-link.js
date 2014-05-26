'use strict';

define(['angular'], function (angular) {

    angular.module('matchLink', []).
        factory('matchLink', ['$location', function ($location) {
            return function (matchId) {
                var port = $location.port();
                if (port == 80 || port == 443) {
                    port = "";
                } else {
                    port = ":" + port;
                }
                return $location.protocol() + "://" + $location.host() + port + "/match/" + matchId;
            };
        }]);
});

