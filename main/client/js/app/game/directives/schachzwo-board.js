'use strict';

define(['angular', 'jquery', 'schachzwo-board.ui'], function (angular, $) {

    angular.module('schachzwoBoard', []).
        directive('schachzwoBoard', function ($parse, $timeout) {

            return {
                restrict: "A",
                link: function (scope, element, attrs) {

                    var modelInvoker = $parse(attrs.ngModel);
                    var boardSizeInvoker = $parse(attrs.boardSize);
                    var selfColorInvoker = $parse(attrs.selfColor);
                    var onSelectInvoker = $parse(attrs.onSelect);

                    $(element).schachzwo({
                        selfColor: selfColorInvoker(scope) || 'black',
                        boardSize: boardSizeInvoker(scope) || 9,
                        onSelect: function (event, data) {
                            if (attrs.onSelect) {
                                onSelectInvoker(scope, {row: data.row, col: data.col});
                                scope.$apply();
                            }
                        }
                    });

                    scope.$watch(boardSizeInvoker, function (val) {
                        if (val) {
                            $(element).schachzwo('option', 'boardSize', val);
                        }
                    });

                    scope.$watch(selfColorInvoker, function (val) {
                        if (val) {
                            $(element).schachzwo('option', 'self', val);
                        }
                    });

                    scope.$watchCollection(modelInvoker, function (val) {
                        $(element).schachzwo("show", val);
                    });

                }
            };

        });

})
;