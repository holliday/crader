'use strict';

const EventEmitter = require('events');

class TraderBase extends EventEmitter {
    constructor(conf) {
        super();
        this.conf = conf;
    }

    accept(advice) {
        // do nothing
    }
};

module.exports = TraderBase;
