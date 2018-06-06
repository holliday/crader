'use strict';

global.root_require = name => require(__dirname + '/' + name);

const _ = require('underscore');
const meow = require('meow');
const path = require('path');
require('manakin').global; // color console

const common = root_require('common');

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
function require_type(type, name) {
    if(_.isUndefined(name)) throw new Error(`Unspecified ${type}`);
    return root_require(type + '/' + name);
}

////////////////////
function read_conf(names) {
    var conf = { };

    if(!_.isUndefined(names)) {
        [].concat(names).forEach(name => {
            Object.assign(conf, require_type('conf', name));
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

    var feed = require_type('feed', conf.feed)(conf);
    var strat = root_require('strat/base')(conf);
    var trader = require_type('trader', conf.trader)(conf);

    feed.on('trades', trades => strat.advise(trades));
    strat.on('advice', advice => trader.accept(advice));

    await feed.run();

    console.log('DONE!');
    process.exit(0);

} catch(e) {
    console.error(e);
    process.exit(1);

} })();
