'use strict';

const ansi   = lib_require('ansi');
const as     = lib_require('as');
const is     = lib_require('is');
const sqlite = lib_require('sqlite');

const strat = {};

strat.init = conf => {
    this.conf = conf;

    conf.db_name = conf.exchange_name
        + '_' + conf.symbol.asset
        + '_' + conf.symbol.money;
    console.log('Opening cache database:', as.bold(conf.db_name));

    // open/create database and data table
    conf.db = new sqlite('cache/' + conf.db_name + '.sqlite');

    conf.db.exec(`CREATE TABLE IF NOT EXISTS data (
        timestamp INTEGER PRIMARY KEY,
        price REAL NOT NULL,
        amount REAL NOT NULL
    ) WITHOUT ROWID;`);

    conf.db_insert = conf.db.prepare(`INSERT OR REPLACE INTO data
        VALUES (:timestamp, :price, :amount);`
    );

    // if no start, get the last timestamp from the database
    if(is.undef(conf.start)) {
        var trade = conf.db.prepare(`SELECT * FROM data
            ORDER BY timestamp DESC LIMIT 1;`
        ).all();

        if(trade.length) {
            conf.start = trade[0].timestamp;
            console.log('Resuming from:', as.bold(as.date(conf.start)));
        }
    }
    conf.step = conf.frame * conf.count;
};

strat.advise = trades => {
    if(trades.length) {
        this.conf.db.begin();
        try {
            trades.forEach(trade => this.conf.db_insert.run(trade));

            console.log('Cached', as.int(trades.length), 'trades:',
                as.blue(as.date(trades[0].timestamp)),
                '-',
                as.blue(as.date(trades.end().timestamp)),
            );

            this.conf.db.commit();
        } finally {
            if(this.conf.db.inTransaction) this.conf.db.rollback();
        }
    }

    console.log(as.now());
    ansi.move_prev();
};

////////////////////
module.exports = strat;
