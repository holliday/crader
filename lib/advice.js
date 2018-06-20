'use strict';

////////////////////
const buy = 'buy';
const sell = 'sell';

class Advice {
    constructor(side) {
        this.side = side;
    }

    static buy() { return new Advice(buy); }
    static sell() { return new Advice(sell); }

    static is_buy(advice) {
        return advice instanceof Advice && advice.side === buy;
    }
    static is_sell(advice) {
        return advice instanceof Advice && advice.side === sell;
    }
}

////////////////////
module.exports = Advice;
