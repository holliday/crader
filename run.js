'use strict';

const common = require('./common');

////////////////////
(async () => { try {
    var conf = {};

    common.read_args(conf);
    console.log('Merged conf:', conf);
    common.process(conf);

    var f = await common.local_require('feed', conf.feed).create(conf);
    var s = await common.local_require('strat', 'base').create(conf);
    var t = await common.local_require('trader', conf.trader).create(conf);

    process.on('SIGINT' , () => conf.stop = true);
    process.on('SIGTERM', () => conf.stop = true);

    f.on('trades', trades => s.advise(trades));
    f.on('done'  , ()     => t.print_summary());
    s.on('advice', advice => t.accept(advice));

    await f.run();

} catch(e) {
    console.error(e.message);
    process.exit(1);
} })();
