'use strict';

const fs = require('fs');
require('manakin').global; // color console
const minimist = require('minimist');
const options = require('minimist-options');
const path = require('path');

root_require('core');
root_require('lib/show');
const symbol = root_require('lib/symbol');

const common = {};

// parse generic value from conf
common.parse = (conf, name, not_null) => {
    var value = conf[name];
    if(not_null && !is_def(value)) throw new Error('Unspecified ' + name);

    return value;
};

function _parse_num(call, conf, name, not_null) {
    var value = conf[name];
    if(!is_def(value)) {
        if(not_null) throw new Error('Unspecified ' + name);
        else return value;
    }
    value = call(value);
    if(isNaN(value)) throw new Error('Invalid ' + name);

    return value;
}

// parse numeric value from conf
common.parse_int    = (conf, name, not_null) => _parse_num(parseInt    , conf, name, not_null);
common.parse_float  = (conf, name, not_null) => _parse_num(parseFloat  , conf, name, not_null);
common.parse_period = (conf, name, not_null) => _parse_num(parse_period, conf, name, not_null);
common.parse_date   = (conf, name, not_null) => _parse_num(parse_date  , conf, name, not_null);

////////////////////
common.local_require = (type, name) => {
    if(!is_def(name)) throw new Error('Unspecified ' + type);

    var path = type + '/' + name + '.js';
    try {
        fs.accessSync(path, fs.constants.R_OK);
    } catch(e) {
        throw new Error('Non-existent or inaccessible file ' + path);
    }
    return root_require(path);
}

////////////////////
function _print_banner() {
    console.log(yellow(
`
      ...                                      ..
   xH88"\`~ .x8X                              dF
 :8888   .f"8888Hf    .u    .               '88bu.                    .u    .
:8888>  X8L  ^""\`   .d88B :@8c        u     '*88888bu        .u     .d88B :@8c
X8888  X888h       ="8888f8888r    us888u.    ^"*8888N    ud8888.  ="8888f8888r
88888  !88888.       4888>'88"  .@88 "8888"  beWE "888L :888'8888.   4888>'88"
88888   %88888       4888> '    9888  9888   888E  888E d888 '88%"   4888> '
88888 '> \`8888>      4888>      9888  9888   888E  888E 8888.+"      4888>
\`8888L %  ?888   !  .d888L .+   9888  9888   888E  888F 8888L       .d888L .+
 \`8888  \`-*""   /   ^"8888*"    9888  9888  .888N..888  '8888c. .+  ^"8888*"
   "888.      :"       "Y"      "888*""888"  \`"888*""    "88888%       "Y"
     \`""***~"\`                   ^Y"   ^Y'      ""         "YP'
`
    ));
}

////////////////////
const opts = options({
    help    : { type: 'boolean', alias: 'h' },
    version : { type: 'boolean', alias: 'v' },

    feed    : { type: 'string' ,            },
    live    : { type: 'boolean',            }, // shorthand for --feed=live
    cache   : { type: 'boolean',            }, // shorthand for --feed=cache

    exchange: { type: 'string' , alias: 'x' },
    symbol  : { type: 'string' , alias: 'y' },
    api_key : { type: 'string' , alias: 'api-key' },
    secret  : { type: 'string' ,            },

    strat   : { type: 'string' , alias: 't' },
    frame   : { type: 'string' , alias: 'f' },
    count   : { type: 'string' , alias: 'n' },

    start   : { type: 'string' , alias: 's' },
    end     : { type: 'string' , alias: 'e' },
    period  : { type: 'string' , alias: 'p' },

    trader  : { type: 'string' ,            },
    real    : { type: 'boolean',            }, // shorthand for --trader=real
    paper   : { type: 'boolean',            }, // shorthand for --trader=paper
    asset   : { type: 'string' , alias: 'a' },
    money   : { type: 'string' , alias: 'm' },
});

////////////////////
function _print_help() {
    const node = path.parse(process.argv[0]).base;
    const name = path.parse(process.argv[1]).base;

    console.log(`
Usage: ${node} ${name} [option] <conf>...

Where [option] is one of:
    -h, --help              Show this help screen
    -v, --version           Show version

        --feed=<name>       Feed name
        --live              Shorthand for --feed=live
        --cache             Shorthand for --feed=cache

    -x, --exchange=<name>   Exchange name
    -y, --symbol=<name>     Symbol name (eg, BTC/USDT)
        --api-key=<value>   API key value
        --secret=<value>    Secret key value

    -t, --strat=<name>      Strat name
    -f, --frame=<period>    Frame period
    -n, --count=<n>         Count of frames

    -s, --start=<datetime>  Start date/time
    -e, --end=<datetime>    End date/time
    -p, --period=<period>   Period relative to --start or --end

        --trader=<name>     Trader name
        --paper             Shorthand for --trader=paper
        --real              Shorthand for --trader=real
    -a, --asset=<n>         Starting asset amount (paper trader)
    -m, --money=<n>         Starting money amount (paper trader)

        ...                 Conf-specific options

and <conf> is one or more conf files to use.

Command line options override those in the conf files.

The <period> argument of the --frame and --period is in milliseconds,
unless suffixed by one of: s - seconds, m - minutes, h - hours, d - days
or w - weeks.

For candlestick strats, the --count <n> argument should be set to the
number of candles and the --frame <period> should be set to candle size.
Otherwise, the --count <n> should be set to 1 and the --frame <period>
should be set to the length of time for past trades needed by the strat.

The --period option specifies testing period relative to either the
--start or the --end option. Valid --start, --end and --period
combinations are:
    start           run from start date/time until interrupted
    start/end       run from start date/time until end date/time
    start/period    run from start date/time for a period of time
    end             run from now until end date/time
    end/period      run for a period of time until end date/time
    period          if period > 0, run from now for a period of time
                    if period < 0, run for a period of time until now
    <none>          run from now until interrupted

In conf-specific options, dashes (-) are converted to underscore (_).
`
    );
}

////////////////////
function _merge(conf, names) {
    names.forEach(name => {
        console.log('Opening conf:', name);
        Object.assign(conf, common.local_require('conf', name));
    });
}

////////////////////
common.read_args = conf => {
    var args = minimist(process.argv.slice(2), opts);

    if(args.version === true) {
        console.log(root_require('package.json').version);
        process.exit();
    }

    _print_banner();

    if(args.help === true) {
        _print_help();
        process.exit();
    }

    _merge(conf, args._);

    for(var name in args) {
        switch(name) {
            case 'live':
            case 'cache':
                if(args[name] === true) conf.feed = name;
                break;

            case 'paper':
            case 'real':
                if(args[name] === true) conf.trader = name;
                break;

            default:
                if(name in opts.alias
                    || name === '_'
                    || name === 'help'
                    || name === 'version'
                ) continue;

                conf[name.replace('-', '_')] = args[name];
                break;
        }
    }
}

////////////////////
common.process = conf => {
    conf.feed = common.parse(conf, 'feed', !null);

    conf.exchange_name = common.parse(conf, 'exchange', !null);
    delete conf.exchange;
    console.log('Exchange:', bold(conf.exchange_name));

    conf.symbol = new symbol(common.parse(conf, 'symbol', !null));
    console.log('Symbol:', conf.symbol.as_value());

    conf.frame = common.parse_period(conf, 'frame', !null);
    conf.count = common.parse_int(conf, 'count', !null);
    console.log('Length:', bold(conf.frame), 'x', bold(conf.count));

    conf.start = common.parse_date(conf, 'start');
    conf.end = common.parse_period(conf, 'end');
    conf.period = common.parse_date(conf, 'end');

    if(is_def(conf.start)) {
        if(is_def(conf.end)) {
            if(is_def(conf.period))
                throw new Error('Invalid start/end/period combination');

        } else if(is_def(conf.period)) {
            if(conf.period < 1000) throw new Error('Invalid period');

            conf.end = conf.start + conf.period;
            conf.period = undefined;

        } // else conf.end = undefined;

    } else if(is_def(conf.end)) {
        if(is_def(conf.period)) {
            if(conf.period < 1000) throw new Error('Invalid period');

            conf.start = conf.end - conf.period;
            conf.period = undefined;

        } // else conf.start = undefined;

    } else if(is_def(conf.period)) {
        if(conf.period <= 1000) {
            conf.end = Date.now();
            conf.start = conf.end + conf.period;
            conf.period = undefined;

        } else if(conf.period >= 1000) {
            // conf.start = undefined;
            conf.end = Date.now() + conf.period;
            conf.period = undefined;

        } else throw new Error('Invalid period');

    } // else conf.start = conf.end = undefined;

    console.log('Interval:',
        is_def(conf.start) ? bold(as_date(conf.start)) : "...",
        'to',
        is_def(conf.end) ? bold(as_date(conf.end)) : '...'
    );
};

////////////////////
module.exports = common;
