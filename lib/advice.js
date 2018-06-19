'use strict';

const as = lib_require('as');

////////////////////
const buy = 'buy';
const sell = 'sell';

class Advice {
    constructor(side) {
        this.side = side;
    }

    print(symbol, price) {
        console.log('Advice:',
            (this.side === buy ? as.bg_green : as.bg_red)(this.side),
            '@',
            as.money(symbol), as.price(price, '-'),
        );
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
