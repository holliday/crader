'use strict';

const is = lib_require('is');

////////////////////
class Trend {
    constructor() {
        this.states = {};
        this.count = 0;
    }

    add_state(name, advice, persist = 0) {
        this.states[name] = {
            advice: advice,
            persist: persist
        };
    }

    set state(name) {
        if(name !== this.name) {
            this.name = name;
            this.count = 0;
            this.advised = false;
        }
        ++this.count;
    }

    advise(...args) {
        var state = this.states[this.name];
        if(is.undef(state)
            || this.count <= state.persist
            || this.advised
        ) return;

        this.advised = true;
        return state.advice(...args);
    }
}

////////////////////
module.exports = Trend;
