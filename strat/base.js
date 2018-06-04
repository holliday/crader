'use strict';

const EventEmitter = require('events');

class StratBase extends EventEmitter {
    constructor(conf) {
        super();
    }

    init() {
        // do something
    }

    advise(trades) {
        // do something
    }
};

module.exports = conf => new StratBase(conf);
