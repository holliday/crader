'use strict';

const EventEmitter = require('events');

class FeedBase extends EventEmitter {
    constructor() {
        super();
    }

    async run() {
        return new Promise();
    }
};

module.exports = FeedBase;
