'use strict';

const as = lib_require('as');
const is = lib_require('is');

////////////////////
const buy  = 'bought';
const sell = ' sold ';

class Trade {
    constructor(side, timestamp, amount, price) {
        this.side      = side;
        this.timestamp = timestamp;
        this.amount    = amount;
        this.price     = price;
    }

    static buy(timestamp, amount, price) { return new Trade(buy, timestamp, amount, price); }
    static sell(timestamp, amount, price) { return new Trade(sell, timestamp, amount, price); }

    static is_buy(trade) { return trade instanceof Trade && trade.side === buy; }
    static is_sell(trade) { return trade instanceof Trade && trade.side === sell; }

    ////////////////////
    print(symbol, compare) {
        var gain, gain_pct, style;

        var side;
        if(this.side === sell) {
            side = as.red(this.side);

            if(is.def(compare)) {
                gain = this.amount * (this.price - compare.price);
                gain_pct = 100 * (this.price / compare.price - 1);
                style = as.not_in(gain, -0.01, 0.01, { equal: as.gray });
            }
        } else side = as.green(this.side);

        console.log(
            as.gray(as.date(this.timestamp)),
            side,
            as.asset(symbol), as.vol(this.amount, '-'),
            '@',
            as.money(symbol), as.price(this.price, '-'),
            'total:',
            as.money(symbol), as.price(this.amount * this.price, '-'),
            is.def(gain)
                ? style(as.num(gain, '+').trim()) + ' '
                + style(as.num(gain_pct.toPrecision(2), '+').trim()+'%')
                : ''
        );
    }
}

////////////////////
module.exports = Trade;
