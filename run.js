'use strict';
require('./core');

                 require('manakin').global; // color console
const minimist = require('minimist');
const options  = require('minimist-options');
const path     = require('path');
const readline = require('readline');
const as       = lib_require('as');
const is       = lib_require('is');
const parse    = lib_require('parse');
const Symbol   = lib_require('symbol');

////////////////////
function _print_banner() {
    console.log(as.yellow(
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

    strat   : { type: 'string' , alias: 't' },
    frame   : { type: 'string' , alias: 'f' },
    count   : { type: 'string' , alias: 'n' },

    start   : { type: 'string' , alias: 's' },
    end     : { type: 'string' , alias: 'e' },
    period  : { type: 'string' , alias: 'p' },

    trader  : { type: 'string' ,            },
    real    : { type: 'boolean',            }, // shorthand for --trader=real
    paper   : { type: 'boolean',            }, // shorthand for --trader=paper
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

        --max-buy=<n>       Max portion (0.1 - 0.99) of money to use, when buying an asset
        --max-sell=<n>      Max portion (0.1 - 0.99) of asset to sell

        --start-asset=<n>   Starting asset amount (paper)
        --start-money=<n>   Starting money amount (paper)
        --fee=<n>           Trading fee (paper)
        --slippage=<n>      Price slippage (paper)

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
        Object.assign(conf, local_require('conf', name));
    });
}

////////////////////
function read_args(conf) {
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
(async () => { try {
    var conf = {};

    read_args(conf);
    console.log('Merged conf:', conf);

    ////////////////////
    // process common params
    conf.exchange_name = parse.any(conf, 'exchange', !null);
    delete conf.exchange;
    console.log('Exchange:', as.bold(conf.exchange_name));

    conf.symbol = new Symbol(parse.any(conf, 'symbol', !null));
    console.log('Symbol:', as.symbol(conf.symbol));

    conf.frame  = parse.period(conf, 'frame', !null);
    conf.count  = parse.int(conf, 'count', !null);
    console.log('Length:', as.bold(conf.frame), 'x', as.bold(conf.count));

    conf.start  = parse.date(conf, 'start');
    conf.end    = parse.date(conf, 'end');
    conf.period = parse.period(conf, 'period');

    if(is.def(conf.start)) {
        if(is.def(conf.end)) {
            if(is.def(conf.period))
                throw new Error('Invalid start/end/period combination');

        } else if(is.def(conf.period)) {
            if(conf.period < 1000) throw new Error('Invalid period');

            conf.end = conf.start + conf.period;
            conf.period = undefined;

        } // else conf.end = undefined;

    } else if(is.def(conf.end)) {
        if(is.def(conf.period)) {
            if(conf.period < 1000) throw new Error('Invalid period');

            conf.start = conf.end - conf.period;
            conf.period = undefined;

        } // else conf.start = undefined;

    } else if(is.def(conf.period)) {
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
        is.def(conf.start) ? as.bold(as.date(conf.start)) : "...",
        'to',
        is.def(conf.end) ? as.bold(as.date(conf.end)) : '...'
    );

    var advisor = await local_require('strat', 'advisor').create(conf);
    var feed = await local_require('feed', conf.feed).create(conf);
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
