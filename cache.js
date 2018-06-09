'use strict';
global.root_require = name => require(__dirname + '/' + name);

const _ = require('underscore');
require('manakin').global; // color console
const meow = require('meow');

const common = root_require('common');
root_require('show');
const sqlite = root_require('sqlite3');

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
function add_to(db, trades) {
    if(!trades.length) return;

    const stmt = db.prepare(`INSERT OR REPLACE INTO data
        VALUES (:timestamp, :date, :price, :amount);`
    );

    db.begin();
    try {
        trades.forEach(trade => {
            Object.assign(trade, { date: as_date(trade.timestamp) });
            stmt.run(trade);
        });

        console.log('Cached', as_int(trades.length), 'trades:',
            blue(as_date(_.first(trades).timestamp)),
            '-',
            blue(as_date(_.last(trades).timestamp)),
        );

        db.commit();
    } finally {
        if(db.inTransaction) db.rollback();
    }
}

////////////////////
(async () => { try {
    common.banner();

    var args = read_args();

    var conf = common.read_conf(args.input);
    conf.frame = '1m';
    conf.count = 1;
    console.log("Merged conf:", conf);

    // set up database
    const name = common.parse_text(conf, 'exchange')
         + '_' + common.parse_text(conf, 'asset')
         + '_' + common.parse_text(conf, 'currency');

    console.log('Opening cache database:', bold(name));
    var db = new sqlite('cache/' + name + '.sqlite');

    db.exec(`CREATE TABLE IF NOT EXISTS data (
        timestamp INTEGER PRIMARY KEY,
        date TEXT,
        price REAL NOT NULL,
        amount REAL NOT NULL
    ) WITHOUT ROWID;`);

    // if neither start nor period was specified,
    // get last timestamp from the database
    if(!('start' in conf || 'period' in conf)) {
        var trades = db.prepare(`SELECT * FROM data
            ORDER BY timestamp DESC LIMIT 1;`
        ).all();

        if(trades.length) conf.start = trades[0].timestamp;
    }

    // set up live feed
    var feed = root_require('feed/live')(conf);
    feed.step = feed.frame * feed.count;

    // rock-n-roll
    feed.on('trades', trades => add_to(db, trades));
    await feed.run();

    console.log('DONE!');
    process.exit(0);

} catch(e) {
    console.error(e);
    process.exit(1);

} })();
