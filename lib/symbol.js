'use strict';

const as = root_require('lib/as');

////////////////////
class Symbol {
    constructor(value) {
        var parts = value.split('/');
        if(parts.length !== 2) throw new Error('Invalid symbol ' + value);

        this.value = value;
        this.asset = parts[0];
        this.money = parts[1];
    }

    as_value() { return this.as_asset() + '/' + this.as_money(); }
    as_asset() { return as.cyan(this.asset); }
    as_money() { return as.magenta(this.money); }
}

////////////////////
module.exports = Symbol;
