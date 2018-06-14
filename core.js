'use strict';
global.root_require = name => require(__dirname + '/' + name);

////////////////////
global.is_def = value => typeof value !== 'undefined';

global.is_array  = value => Array.isArray(value);
global.is_num    = value => typeof value === 'number';
global.is_object = value => typeof value === 'object';
global.is_string = value => typeof value === 'string';

////////////////////
// convert value with optional suffix to time period
// suffix can be one of:
// s - seconds
// m - minutes
// h - hours
// d - days
// w - weeks
// <no suffix> - milliseconds
global.parse_period = value => {
    const mult = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w:  7 * 24 * 60 * 60 * 1000,
    };

    value = String(value);
    var suffix = value.slice(-1);

    if(suffix in mult)
        value = parseFloat(value.slice(0, -1)) * mult[suffix];
    else if('0123456789'.includes(suffix))
        value = parseFloat(value);
    else value = NaN;

    return Math.trunc(value);
}

////////////////////
// convert value to timestamp
global.parse_date = value => (new Date(value)).getTime();

////////////////////
// sleep
global.sleep_for = interval => new Promise(resolve => setTimeout(resolve, interval));
global.sleep_until = date => common.sleep_for(date - Date.now());
