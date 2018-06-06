'use strict';

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

function parse(func, value, name) {
    var num = func(value);
    if(isNaN(num)) throw new Error('Unspecified or invalid ' + name);

    return num;
}

common.parse_int = (value, name) => parse(parseInt, value, name);
common.parse_float = (value, name) => parse(parseFloat, value, name);
common.parse_period = (value, name) => parse(parsePeriod, value, name);

////////////////////
common.sleep_for = interval => new Promise(resolve => setTimeout(resolve, interval));
common.sleep_until = date => common.sleep_for(date - Date.now());

////////////////////
module.exports = common;
