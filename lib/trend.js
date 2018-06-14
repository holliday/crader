'use strict';

root_require('core');

////////////////////
class Trend {
    constructor() {
        this.states = {};
        this.count = 0;
    }

    add_state(name, advice, persist) {
        this.states[name] = { advice: advice, persist: persist };
    }

    set state(name) {
        if(name !== this.name) {
            this.name = name;
            this.count = 0;
            this.advised = false;
        }
        ++this.count;
    }

    advise(timestamp, symbol, price) {
        var state = this.states[this.name];
        if(!is_def(state)
            || this.advised
            || this.count <= state.persist
        ) return;

        var advice = state.advice;
        if(!is_def(advice)) return;

        this.advised = true;
        return advice(timestamp, symbol, price);
    }
}

////////////////////
module.exports = Trend;
