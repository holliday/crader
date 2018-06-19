'use strict';

////////////////////
class Symbol {
    constructor(value) {
        var parts = value.split('/');
        if(parts.length !== 2) throw new Error('Invalid symbol ' + value);

        this.value = value;
        this.asset = parts[0];
        this.money = parts[1];
    }
}

////////////////////
module.exports = Symbol;
