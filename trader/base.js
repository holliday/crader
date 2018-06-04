'use strict';

const EventEmitter = require('events');

class TraderBase extends EventEmitter {
    constructor() {
        super();
    }

    accept(advice) {
        // do nothing
    }
};

module.exports = TraderBase;
