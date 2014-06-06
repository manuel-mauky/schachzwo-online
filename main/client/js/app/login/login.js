'use strict';

define(['angular', 'jquery', 'jquery-validate'], function (angular, $) {

    angular.module("login", [])
        .controller("loginCtrl", ["$scope", "$http", "$routeParams", "endpoint", "$location",
            function ($scope, $http, $routeParams, endpoint, $location) {

                var matchId = $routeParams.matchId;

                $('#login-form').validate({
                    errorClass: 'help-block animation-slideDown',
                    errorElement: 'span',
                    errorPlacement: function(error, e) {
                        e.parents('.form-group > div').append(error);
                    },
                    highlight: function(e) {
                        $(e).closest('.form-group').removeClass('has-success has-error').addClass('has-error');
                        $(e).closest('.help-block').remove();
                    },
                    success: function(e) {
                        e.closest('.form-group').removeClass('has-success has-error');
                        e.closest('.help-block').remove();
                    },
                    rules: {
                        playerName: {
                            required: true,
                            maxlength: 50
                        }
                    },
                    messages: {
                        playerName: {
                            required: ' ',
                            maxlength: 'Der Spielername darf nicht aus mehr als 50 Zeichen bestehen'
                        }
                    }
                });

                $scope.match = {size: 7};

                $http.get(endpoint + "/" + matchId).success(function (match) {
                    $scope.match = match;

                });

                $scope.login = function () {

                    console.log("login : " + matchId);
                    $http.post(endpoint + "/" + matchId + "/login", {name: $scope.playerName})
                        .success(function (player) {
                            $location.path("match/" + matchId);
                        })
                        .error(function (data, status, headers, config) {
                            console.log("error:" + status);
                        });

                };

            }]);

});
