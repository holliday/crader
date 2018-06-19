'use strict';

const is = lib_require('is');

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

    advise() {
        var state = this.states[this.name];
        if(is.undef(state)
            || this.advised
            || this.count <= state.persist
        ) return;

        var advice = state.advice;
        if(is.undef(advice)) return;

        this.advised = true;
        return advice();
    }
}

////////////////////
module.exports = Trend;
