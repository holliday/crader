'use strict';
require('./core');

const readline = require('readline');
const common   = root_require('common');

////////////////////
(async () => { try {
    var conf = {};

    common.read_args(conf);
    console.log('Merged conf:', conf);
    common.process(conf);

    var feed   = await local_require('feed', conf.feed).create(conf);
    var strat  = await local_require('strat', 'base').create(conf);
    var trader = await local_require('trader', conf.trader).create(conf);

    feed.on ('trades', trades => strat.advise(trades));
    feed.on ('done'  , ()     => trader.print_summary());
    strat.on('advice', advice => trader.accept(advice));

    ////////////////////
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    process.stdin.on('keypress', (ch, key) => {
        if(key.ctrl) switch(key.name) {
            case 'c':
            case 'q':
                setImmediate(process.exit);
                conf.stop = true;
                break;

            case 's': trader.print_summary(); break;
        }
    });

    ////////////////////
    await feed.run();

} catch(e) {
    console.error(e.message);
    process.exit(1);
} })();
