'use strict';

const ansi = lib_require('ansi');
const as   = lib_require('as');

const strat = {};

strat.init = conf => {};

strat.advise = trades => {
    console.log(as.now());
    ansi.move_prev();
};

module.exports = strat;
