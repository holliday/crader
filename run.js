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

    var feed = await local_require('feed', conf.feed).create(conf);
    var advisor = await local_require('strat', 'advisor').create(conf);
    var trader = await local_require('trader', conf.trader).create(conf);

    feed.on('trades', trades => advisor.receive(trades));
    advisor.on('advice', advice => trader.accept(advice));

    feed.on('done', () => {
        trader.print_summary()
        setImmediate(process.exit);
    });

    ////////////////////
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    process.stdin.on('keypress', (ch, key) => {
        if(key.ctrl) switch(key.name) {
            case 'c': setImmediate(process.exit); break;
            case 's': trader.print_summary(); break;
            case 'q': conf.stop = true; break;
        }
    });

    ////////////////////
    await feed.run();

} catch(e) {
    console.error(e.message);
    process.exit(1);
} })();
