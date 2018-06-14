'use strict';

class Series extends Array {
    end(n = 0) {
        return this[this.length - 1 + n];
    }

    get(name) {
        return this.map(elem => elem[name]);
    }
}

module.exports = Series;
