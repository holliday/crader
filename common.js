'use strict';
global.root_require = name => require(__dirname + '/' + name);

const _ = require('underscore');
const fs = require('fs');
require('manakin').global; // color console
const minimist = require('minimist');
const options = require('minimist-options');
const path = require('path');

root_require('show');

const common = {};

////////////////////
// convert value with optional suffix to time period
// suffix can be one of:
// s - seconds
// m - minutes
// h - hours
// d - days
// w - weeks
// <no suffix> - milliseconds
global.parsePeriod = value => {
    const mult = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w:  7 * 24 * 60 * 60 * 1000,
    };

    value = String(value);
    var suffix = value.slice(-1);

    if(suffix in mult)
        value = parseFloat(value.slice(0, -1)) * mult[suffix];
    else if('0123456789'.includes(suffix))
        value = parseFloat(value);
    else value = NaN;

    return Math.trunc(value);
}

// convert value to timestamp
global.parseDate = value => (new Date(value)).getTime();

// parse generic value from conf
common.parse = (conf, name, not_null) => {
    var value = conf[name];
    if(not_null && _.isUndefined(value)) throw new Error('Unspecified ' + name);

    return value;
};

function _parse_num(call, conf, name, not_null) {
    var value = conf[name];
    if(_.isUndefined(value)) {
        if(not_null) throw new Error('Unspecified ' + name);
        else return value;
    }
    value = call(value);
    if(isNaN(value)) throw new Error('Invalid ' + name);

    return value;
}

// parse numeric value from conf
common.parse_int    = (conf, name, not_null) => _parse_num(parseInt   , conf, name, not_null);
common.parse_float  = (conf, name, not_null) => _parse_num(parseFloat , conf, name, not_null);
common.parse_period = (conf, name, not_null) => _parse_num(parsePeriod, conf, name, not_null);
common.parse_date   = (conf, name, not_null) => _parse_num(parseDate  , conf, name, not_null);

////////////////////
common.sleep_for = interval => new Promise(resolve => setTimeout(resolve, interval));
common.sleep_until = date => common.sleep_for(date - Date.now());

////////////////////
common.local_require = (type, name) => {
    if(_.isUndefined(name)) throw new Error('Unspecified ' + type);
    try {
        var path = type + '/' + name + '.js';
        fs.accessSync(path, fs.constants.R_OK);

        return root_require(path);

    } catch(e) {
        throw new Error('Non-existent or inaccessible file ' + path);
    }
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
    paper   : { type: 'boolean',            }, // shorthand for --trader=paper
    real    : { type: 'boolean',            }, // shorthand for --trader=real
    assets  : { type: 'string' , alias: 'a' },
    currency: { type: 'string' , alias: 'c' },
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
    -a, --assets=<n>        Starting assets (paper trader)
    -c, --currency=<n>      Starting currency (paper trader)

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
function _read_conf(names) {
    var conf = { };
    names.forEach(name => {
        console.log('Opening conf:', name);
        Object.assign(conf, common.local_require('conf', name));
    });
    return conf;
}

////////////////////
common.read_conf = () => {
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

    var conf = _read_conf(args._);

    // process args
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

    console.log('Merged conf:', conf);
    return conf;
}

////////////////////
common.process = conf => {
    conf.feed = common.parse(conf, 'feed', !null);

    conf.exchange_name = common.parse(conf, 'exchange', !null);
    delete conf.exchange;
    console.log('Exchange:', bold(conf.exchange_name));

    conf.symbol = common.parse(conf, 'symbol', !null);
    console.log('Symbol:', bold(conf.symbol));

    conf.frame = common.parse_period(conf, 'frame', !null);
    conf.count = common.parse_int(conf, 'count', !null);
    console.log('Length:', bold(conf.frame), 'x', bold(conf.count));

    conf.start = common.parse_date(conf, 'start');
    conf.end = common.parse_period(conf, 'end');
    conf.period = common.parse_date(conf, 'end');

    const defined = x => !_.isUndefined(x);

    if(defined(conf.start)) {
        if(defined(conf.end)) {
            if(defined(conf.period))
                throw new Error('Invalid start/end/period combination');

        } else if(defined(conf.period)) {
            if(conf.period < 1000) throw new Error('Invalid period');

            conf.end = conf.start + conf.period;
            conf.period = undefined;

        } // else conf.end = undefined;

    } else if(defined(conf.end)) {
        if(defined(conf.period)) {
            if(conf.period < 1000) throw new Error('Invalid period');

            conf.start = conf.end - conf.period;
            conf.period = undefined;

        } // else conf.start = undefined;

    } else if(defined(conf.period)) {
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
        defined(conf.start) ? bold(as_date(conf.start)) : "...",
        'to',
        defined(conf.end) ? bold(as_date(conf.end)) : '...'
    );
};

////////////////////
module.exports = common;
