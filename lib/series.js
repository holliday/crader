'use strict';

////////////////////
function _merge(to, from, off = 0) {
    from.forEach((elem, n) => {
        to[off + n] = Object.assign(
            Object.assign({}, to[off + n]), elem
        );
    });
}

////////////////////
class Series extends Array {
    end(n = 0) {
        return this[this.length - 1 + n];
    }

    get(names) {
        if(Array.isArray(names))
            return this.map(elem => {
                var value = {};
                for(var name of names)
                    if(name in elem) value[name] = elem[name];
                return value;
            });

        else return this.map(elem => elem[names]);
    }

    drop(name) {
        this.forEach(elem => delete elem[name]);
        return this;
    }

    merge(series) {
        _merge(this, series);
        return this;
    }

    merge_end(series) {
        if(this.length < series.length) {
            var that = this.splice(0);
            this.concat(Array(series.length - that.length)).concat(that);
        }
        _merge(this, series, this.length - series.length);
        return this;
    }
}

////////////////////
module.exports = Series;
