'use strict';

////////////////////
const buy = Symbol('buy');
const sell = Symbol('sell');

class Trade {
    constructor(side, timestamp, amount, price) {
        this.side      = side;
        this.timestamp = timestamp;
        this.amount    = amount;
        this.price     = price;
    }

    static buy(timestamp, amount, price) { return new Trade(buy, timestamp, amount, price); }
    static sell(timestamp, amount, price) { return new Trade(sell, timestamp, amount, price); }

    ////////////////////
    is_buy() { return this.side === buy; }
    is_sell() { return this.side === sell; }
}

////////////////////
module.exports = Trade;
