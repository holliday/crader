'use strict';

const is = lib_require('is');

////////////////////
const buy = Symbol('buy');
const sell = Symbol('sell');

class Advice {
    constructor(timestamp, side, price) {
        this.timestamp = timestamp;
        this.side = side;
        this.price = price;
    }

    static buy(price) { return new Advice(global.now, buy, price); }
    static sell(price) { return new Advice(global.now, sell, price); }

    ////////////////////
    is_buy() { return this.side === buy; }
    is_sell() { return this.side === sell; }

    ////////////////////
    is_limit() { return is.def(this.price); }
    is_market() { return is.undef(this.price); }
}

////////////////////
module.exports = Advice;
