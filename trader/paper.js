'use strict';

const _ = require('underscore');

const advice = root_require('advice');
root_require('show');
const TraderBase = root_require('trader/base');

////////////////////
class PaperTrader extends TraderBase {
    constructor(asset, asset_amount, currency, currency_amount) {
        super();

        this.asset = asset;
        this.asset_amount = this.init_asset_amount = asset_amount;

        this.currency = currency;
        this.currency_amount = this.init_currency_amount = currency_amount;

        this.print_balance();
    }

    static create(conf) {
        console.log('Creating', bold('paper'), 'trader');

        var asset_amount = parseFloat(conf.asset_amount);
        if(isNaN(asset_amount)) asset_amount = 0;

        var currency_amount = parseFloat(conf.currency_amount);
        if(isNaN(currency_amount)) currency_amount = 0;

        if(asset_amount + currency_amount <= 0.0001)
            console.warn('Neither assest nor currency amount specified');

        return new PaperTrader(conf.asset, asset_amount, conf.currency, currency_amount);
    }

    perf() {
        if('price' in this) {
            var play = this.currency_amount + this.asset_amount * this.price;
            var hold = this.init_currency_amount + this.init_asset_amount * this.price;
            return (play / hold - 1) * 100;
        }
    }

    print_balance() {
        var perf = this.perf();

        console.log();
        console.log(bold('Balance:'),
            as_vol(this.asset_amount), cyan(this.asset),
            as_price(this.currency_amount), magenta(this.currency), 
            !_.isUndefined(perf)
                ? comp_to(perf, 0)(as_fixed(perf, '+')) + '%'
                    + gray(' (compared to buy/hold)')
                : ''
        );
        console.log();
    }

    _print_order(type, asset_amount, currency_amount) {
        console.log('Executing', type, 'order:',
            as_vol(asset_amount), cyan(this.asset),
            'for',
            as_price(currency_amount), magenta(this.currency),
        );
    }

    buy(price) {
        if(this.currency_amount > 0) {
            var asset_amount = this.currency_amount * 0.99 / price;
            var currency_amount = asset_amount * price;

            this._print_order(bg_green('buy'), asset_amount, currency_amount);

            this.currency_amount -= currency_amount;
            this.asset_amount += asset_amount;
        }
        else console.log('Not buying due to lack of currency');

        this.price = price;
    }

    sell(price) {
        if(this.asset_amount > 0) {
            var asset_amount = this.asset_amount * 0.99;
            var currency_amount = asset_amount * price;

            this._print_order(bg_red('sell'), asset_amount, currency_amount);

            this.currency_amount += currency_amount;
            this.asset_amount -= asset_amount;
        }
        else console.log('Not selling due to lack of assets');

        this.price = price;
    }

    accept(adv) {
        if(advice.is_buy(adv)) {
            this.buy(adv.price);
            this.print_balance();
            console.log();

        } else if(advice.is_sell(adv)) {
            this.sell(adv.price);
            this.print_balance();
            console.log();
        }
    }
};

////////////////////
module.exports = conf => PaperTrader.create(conf);
