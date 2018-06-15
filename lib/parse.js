'use strict';

const is = lib_require('is');

const parse = {};

////////////////////
// parse generic value from conf
parse.any = (conf, name, not_null) => {
    var value = conf[name];
    if(not_null && is.undef(value)) throw new Error('Unspecified ' + name);
    return value;
};

////////////////////
// convert value with optional suffix to time period
// suffix can be one of:
// s - seconds
// m - minutes
// h - hours
// d - days
// w - weeks
// <no suffix> - milliseconds
function parsePeriod(value) {
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
function parseDate(value) {
    return (new Date(value)).getTime();
}

////////////////////
function _parse_num(call, conf, name, not_null) {
    var value = conf[name];
    if(is.undef(value)) {
        if(not_null) throw new Error('Unspecified ' + name);
        else return value;
    }
    value = call(value);
    if(isNaN(value)) throw new Error('Invalid ' + name);

    return value;
}

////////////////////
// parse numeric value from conf
parse.int    = (conf, name, not_null) => _parse_num(parseInt   , conf, name, not_null);
parse.float  = (conf, name, not_null) => _parse_num(parseFloat , conf, name, not_null);
parse.period = (conf, name, not_null) => _parse_num(parsePeriod, conf, name, not_null);
parse.date   = (conf, name, not_null) => _parse_num(parseDate  , conf, name, not_null);

////////////////////
module.exports = parse;
