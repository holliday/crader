'use strict';

const EventEmitter = require('events');

////////////////////
class TraderBase extends EventEmitter {
    constructor(conf) {
        super();
        this.conf = conf;
    }

    static async create(conf) {
        return new TraderBase(conf);
    }

    ////////////////////
    accept(advice) {
        // do nothing
    }
};

////////////////////
module.exports = TraderBase;
