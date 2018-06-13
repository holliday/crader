'use strict';

root_require('lib/show');

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
    as_asset() { return cyan(this.asset); }
    as_money() { return magenta(this.money); }
}

////////////////////
module.exports = Symbol;
