'use strict';

define(['angular'], function (angular) {

    angular.module('endMessages', []).
        factory('endMessages', [function () {
            return function (endCause) {

                switch (endCause) {
                    case "won-check-mate":
                        return "Du hast gewonnen! – Sieg durch „Schach Matt“, du bekommst 0,5 Punkte!";
                    case "won-check-target":
                        return "Du hast gewonnen! – Sieg durch „Schach Ziel“, du bekommst 2 Punkte!";
                    case "won-check-target-2":
                        return "Du hast gewonnen! – Sieg durch „Schach Ziel mit Nachrücken“, du bekommst 2 Punkte!";
                    case "won-given-up":
                        return "Du hast gewonnen! – Dein Mitspieler hat aufgegeben, du bekommst 2 Punkte!";
                    case "lost-check-mate":
                        return "Du hast verloren! – Verlust durch „Schach Matt“!";
                    case "lost-check-target":
                        return "Du hast verloren! – Verlust durch „Schach Ziel“!";
                    case "lost-given-up":
                        return "Du hast verloren! – Verlust durch Aufgeben!";
                    case "lost-can-follow-up":
                        return "Du hast verloren! – Verlust durch „Schach Ziel mit Nachrücken“, du bekommst 1 Punkt!";
                    case "draw":
                        return "Remis! – Du bekommst 0,5 Punkte.";
                    default:
                        return "";
                }

            };
        }]);
});
