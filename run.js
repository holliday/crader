'use strict';

const common = require('./common');

////////////////////
(async () => { try {
    var conf = {};

    common.read_args(conf);
    common.process(conf);

    var feed   = new (common.local_require('feed', conf.feed))(conf);
    var strat  = new (common.local_require('strat', 'base'))(conf);
    var trader = new (common.local_require('trader', conf.trader))(conf);

    process.on('SIGINT' , () => conf.stop = true);
    process.on('SIGTERM', () => conf.stop = true);

    feed.on('trades', trades => strat.advise(trades));
    strat.on('advice', advice => trader.accept(advice));

    await feed.run();

    console.log('DONE!');
    process.exit(0);

} catch(e) {
    console.error(e);
    process.exit(1);

} })();
