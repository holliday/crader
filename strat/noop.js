'use strict';

const advice = root_require('advice');
const ind = root_require('indicators');
root_require('show');

const strat = {};

strat.init = conf => {
    // do something
};

strat.advise = trades => {
    // do something

    console.log('Received', bold(trades.length), 'trades:');
    trades.forEach(trade => {
        console.log(blue(as_date(trade.timestamp)),
            yellow(as_vol(trade.amount)), '@', bold(as_price(trade.price, '-'))
        );
    });

    //return advice.buy();
    // or
    //return advice.sell();
}

module.exports = strat;
