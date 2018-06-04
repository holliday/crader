'use strict';

const meow = require('meow');
const path = require('path');
require('manakin').global; // color console

const common = require('./common');

////////////////////
function read_args() {
    var node = path.parse(process.argv[0]).base;
    var name = path.parse(process.argv[1]).base;
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
Usage: ${node} ${name} [option] <conf>...

Where [option] is one of:
    -h, --help           Show this help screen
    -v, --version        Show version

and <conf> is one or more conf files to use.
`
    });
    return args;
}

////////////////////
function local_require(type, name) {
    if(typeof name === 'undefined') throw new Error(`Unspecified ${type}`);
    return require('./' + type + '/' + name);
}

////////////////////
function read_conf(names) {
    var conf = { };

    if(typeof names !== 'undefined') {
        [].concat(names).forEach(name => {
            Object.assign(conf, local_require('conf', name));
        });
    }

    return conf;
}

////////////////////
(async () => { try {
    common.banner();

    var args = read_args();

    var conf = read_conf(args.input);
    console.log("Merged conf:", conf);

    var feed = local_require('feed', conf.feed)(conf);
    var strat = local_require('strat', 'base')(conf);
    var trader = local_require('trader', conf.trader)(conf);

    feed.on('trades', trades => strat.advise(trades));
    strat.on('advice', advice => trader.accept(advice));

    await feed.run();

    console.log('DONE!');
    process.exit(0);

} catch(e) {
    console.error(e);
    process.exit(1);

} })();
