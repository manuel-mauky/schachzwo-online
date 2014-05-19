'use strict';

define(['angular', 'jquery', 'schachzwo-board.ui'], function (angular, $) {

    angular.module('schachzwoBoard', []).
        directive('schachzwoBoard', ['$parse', '$timeout', function ($parse, $timeout) {

            return {
                restrict: "A",
                link: function (scope, element, attrs) {

                    var modelInvoker = $parse(attrs.ngModel);
                    var boardSizeInvoker = $parse(attrs.boardSize);
                    var ownColorInvoker = $parse(attrs.ownColor);
                    var onSelectInvoker = $parse(attrs.onSelect);

                    $(element).schachzwo({
                        ownColor: ownColorInvoker(scope) || 'black',
                        boardSize: boardSizeInvoker(scope) || 9,
                        onSelect: function (event, data) {
                            if (attrs.onSelect) {
                                onSelectInvoker(scope, {row: data.row, column: data.column});
                                scope.$apply();
                            }
                        }
                    });

                    scope.$watch(boardSizeInvoker, function (val) {
                        if (val) {
                            $(element).schachzwo('option', 'boardSize', val);
                        }
                    });

                    scope.$watch(ownColorInvoker, function (val) {
                        if (val) {
                            $(element).schachzwo('option', 'self', val);
                        }
                    });

                    scope.$watchCollection(modelInvoker, function (val) {
                        $(element).schachzwo("show", val);
                    });

                }
            };

        }]);

})
;