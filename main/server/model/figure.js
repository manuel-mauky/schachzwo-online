"use strict";

var assert = require("assert");

/**
 * The Figure constructor. This the figures of the game.
 * Every figure is defined by its color and type (see
 *
 *
 * @param json a json representation of the figure.
 * @returns {Figure}
 * @constructor
 */
var Figure = function (json) {
    assert.ok(json);
    assert.ok(json.color);
    assert.ok(json.type);

    this.color = json.color;
    this.type = json.type;

    return this;
};

module.exports = Figure;
