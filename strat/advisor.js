'use strict';

const EventEmitter = require('events');
const Advice       = lib_require('advice');
const as           = lib_require('as');
const is           = lib_require('is');
const parse        = lib_require('parse');
const Series       = lib_require('series');

////////////////////
class Advisor extends EventEmitter {
    constructor(conf) {
        super();
        console.log('Creating advisor');

        conf.strat_name = parse.any(conf, 'strat', !null);
        delete conf.strat;

        console.log('Creating strat:', as.bold(conf.strat_name));
        conf.strat = local_require('strat', conf.strat_name);

        console.log('Initializing strat');
        conf.strat.init(conf);

        this.conf = conf;
        this.advices = new Series();
    }

    static async create(conf) {
        return new Advisor(conf);
    }

    ////////////////////
    print_advice(advice) {
        console.log('Advice:',
            advice.is_buy()
                ? as.bg_green('buy')
                : as.bg_red('sell'),
            '@',
            as.money(this.conf.symbol),
            advice.is_market()
                ? 'market price'
                : as.price(advice.price, '-')
        );
    }

    ////////////////////
    receive(trades) {
        var advice = this.conf.strat.advise(trades);

        if(advice instanceof Advice) {
            this.advices.push(advice);

            this.print_advice(advice);
            this.emit('advice', advice);
        }
    }
};

////////////////////
module.exports = Advisor;
