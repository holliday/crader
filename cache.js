'use strict';
require('./core');

const as     = root_require('lib/as');
const common = root_require('lib/common');
const sqlite = root_require('lib/sqlite');

////////////////////
(async () => { try {
    var conf = {};

    common.read_args(conf);
    conf.feed = 'live'
    conf.frame = '1m';
    conf.count = 1;
    console.log('Merged conf:', conf);
    common.process(conf);

    // set up database
    var db_name = conf.exchange_name + '_' + conf.symbol.asset + '_' + conf.symbol.money;
    console.log('Opening cache database:', as.bold(db_name));

    var db = new sqlite('cache/' + db_name + '.sqlite');

    db.exec(`CREATE TABLE IF NOT EXISTS data (
        timestamp INTEGER PRIMARY KEY,
        date TEXT,
        price REAL NOT NULL,
        amount REAL NOT NULL
    ) WITHOUT ROWID;`);

    var db_insert = db.prepare(`INSERT OR REPLACE INTO data
        VALUES (:timestamp, :date, :price, :amount);`
    );

    // if no start, get the last timestamp from the database
    if(!is_def(conf.start)) {
        var trade = db.prepare(`SELECT * FROM data
            ORDER BY timestamp DESC LIMIT 1;`
        ).all();

        if(trade.length) {
            conf.start = trade[0].timestamp;
            console.log('Resuming from:', as.bold(as.date(conf.start)));
        }
    }

    // set up live feed
    var feed = await common.local_require('feed', 'live').create(conf);
    conf.step = conf.frame * conf.count;

    process.on('SIGINT' , () => conf.stop = true);
    process.on('SIGTERM', () => conf.stop = true);

    // rock-n-roll
    feed.on('trades', trades => {
        if(!trades.length) return;

        db.begin();
        try {
            trades.forEach(trade => {
                Object.assign(trade, { date: as.date(trade.timestamp) });
                db_insert.run(trade);
            });

            console.log('Cached', as.int(trades.length), 'trades:',
                as.blue(as.date(trades[0].timestamp)),
                '-',
                as.blue(as.date(trades.end().timestamp)),
            );

            db.commit();
        } finally {
            if(db.inTransaction) db.rollback();
        }
    });
    feed.on('done', () => console.log('DONE'));

    await feed.run();

} catch(e) {
    console.error(e.message);
    process.exit(1);
} })();
