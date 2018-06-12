'use strict';

const common = require('./common');

////////////////////
(async () => { try {
    var conf = {};

    common.read_args(conf);
    console.log('Merged conf:', conf);
    common.process(conf);

    var feed   = await common.local_require('feed', conf.feed).create(conf);
    var strat  = await common.local_require('strat', 'base').create(conf);
    var trader = await common.local_require('trader', conf.trader).create(conf);

    process.on('SIGINT' , () => conf.stop = true);
    process.on('SIGTERM', () => conf.stop = true);

    feed.on('trades', trades => strat.advise(trades));
    strat.on('advice', advice => trader.accept(advice));

    await feed.run();

    console.log('DONE!');
    process.exit(0);

} catch(e) {
    console.error(e.message);
    process.exit(1);

} })();
