'use strict';
global.root_require = name => require(__dirname + '/' + name);

const _ = require('underscore');
const path = require('path');

root_require('show');

const common = {};

////////////////////
common.banner = () => {
    console.log(yellow(
`
      ...                                      ..
   xH88"\`~ .x8X                              dF
 :8888   .f"8888Hf    .u    .               '88bu.                    .u    .
:8888>  X8L  ^""\`   .d88B :@8c        u     '*88888bu        .u     .d88B :@8c
X8888  X888h       ="8888f8888r    us888u.    ^"*8888N    ud8888.  ="8888f8888r
88888  !88888.       4888>'88"  .@88 "8888"  beWE "888L :888'8888.   4888>'88"
88888   %88888       4888> '    9888  9888   888E  888E d888 '88%"   4888> '
88888 '> \`8888>      4888>      9888  9888   888E  888E 8888.+"      4888>
\`8888L %  ?888   !  .d888L .+   9888  9888   888E  888F 8888L       .d888L .+
 \`8888  \`-*""   /   ^"8888*"    9888  9888  .888N..888  '8888c. .+  ^"8888*"
   "888.      :"       "Y"      "888*""888"  \`"888*""    "88888%       "Y"
     \`""***~"\`                   ^Y"   ^Y'      ""         "YP'
`
    ));
};

////////////////////
common.node = path.parse(process.argv[0]).base;
common.name = path.parse(process.argv[1]).base;

////////////////////
common.require_type = (type, name) => {
    if(_.isUndefined(name)) throw new Error(`Unspecified ${type}`);
    return root_require(type + '/' + name);
};

////////////////////
// load and merge conf files
common.read_conf = (names) => {
    var conf = { };

    if(!_.isUndefined(names)) {
        [].concat(names).forEach(name => {
            Object.assign(conf, common.require_type('conf', name));
        });
    }

    return conf;
};

////////////////////
// convert string with optional suffix to time period
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

function parse(func, conf, name) {
    var num = func(conf[name]);
    if(isNaN(num)) throw new Error('Unspecified or invalid ' + name);

    return num;
}

common.parse_int = (conf, name) => parse(parseInt, conf, name);
common.parse_float = (conf, name) => parse(parseFloat, conf, name);
common.parse_period = (conf, name) => parse(parsePeriod, conf, name);

common.parse_text = (conf, name) => {
    var text = conf[name];
    if(_.isUndefined(text)) throw new Error('Unspecified ' + name);

    return text;
};

common.parse_date = (conf, name) => {
    var date = (new Date(conf[name])).getTime();
    if(isNaN(date)) throw new Error('Unspecified or invalid ' + name);

    return date;
}

////////////////////
common.sleep_for = interval => new Promise(resolve => setTimeout(resolve, interval));
common.sleep_until = date => common.sleep_for(date - Date.now());

////////////////////
module.exports = common;
