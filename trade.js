'use strict';
global.root_require = name => require(__dirname + '/' + name);

require('manakin').global; // color console
const meow = require('meow');

const common = root_require('common');

////////////////////
function read_args() {
    var args = meow({
        flags: {
            help: {
                type: 'boolean',
                alias: 'h',
            },
            version: {
                type: 'boolean',
                alias: 'v',
            },
        },
        help:
`
Usage: ${common.node} ${common.name} [option] <conf>...

Where [option] is one of:
    -h, --help           Show this help screen
    -v, --version        Show version

and <conf> is one or more conf files to use.
`
    });
    return args;
}

////////////////////
(async () => { try {
    common.banner();

    var args = read_args();

    var conf = common.read_conf(args.input);
    console.log("Merged conf:", conf);

    var feed = common.require_type('feed', conf.feed)(conf);
    var strat = root_require('strat/base')(conf);
    var trader = common.require_type('trader', conf.trader)(conf);

    feed.on('trades', trades => strat.advise(trades));
    strat.on('advice', advice => trader.accept(advice));

    await feed.run();

    console.log('DONE!');
    process.exit(0);

} catch(e) {
    console.error(e);
    process.exit(1);

} })();
