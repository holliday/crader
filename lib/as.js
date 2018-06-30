'use strict';

const chalk   = require('chalk');
const moment  = require('moment');
const sprintf = require('sprintf-js').sprintf;
const is      = lib_require('is');

const as = {};

////////////////////
function _shift(num, exp) {
    var val = ('' + num).split('e');
    return +(val[0] + 'e' + (val[1] ? (+val[1] + exp) : exp));
};

// round 'num' to 'prec' decimal digits
// if 'prec' is negative, rounds to tens (-1), hundreds (-2), etc.
as.round = (num, prec) => _shift(Math.round(_shift(num, +prec)), -prec);

function _num(mod, width, prec, type, value) {
    if(is.num(value)) return sprintf(
        '%' + mod + width + (prec ? '.' + prec : '') + type,
        as.round(value, prec)
    ); else return sprintf('%' + mod + width + 's', value);
}

as.date = (value, mod = '') => !isNaN(new Date(value))
    ? moment(value).format('YYYY-MM-DD HH:mm:ss')
    : sprintf('%' + mod + '19s', value);

as.fixed = (value, mod  = '') => _num(mod,  9, 4, 'f', value);
as.int   = (value, mod  = '') => _num(mod,  8, 0, 'd', value);
as.num   = (value, mod  = '') => _num(mod,  8, 4, 'g', value);
as.price = (value, mod  = '') => _num(mod,  9, 7, 'g', value);
as.vol   = (value, mod  = '') => _num(mod, 11, 9, 'g', value);

as.pct   = (value, mod  = '') => sprintf('%' + mod + '9s', (100 * value).toFixed(2) + '%');
as.text  = (value, size = '') => sprintf('%' + size + 's', value);

////////////////////
// chalk styles
as.bold              = chalk.bold;
as.dim               = chalk.dim;
as.italic            = chalk.italic;
as.underline         = chalk.underline;
as.inverse           = chalk.inverse;
as.hidden            = chalk.hidden;
as.strikethrough     = chalk.strikethrough;

as.black             = chalk.black;
as.red               = chalk.red;
as.green             = chalk.green;
as.yellow            = chalk.yellow;
as.blue              = chalk.blue;
as.magenta           = chalk.magenta;
as.cyan              = chalk.cyan;
as.white             = chalk.white;

as.gray              = chalk.gray;
as.bright_red        = chalk.redBright;
as.bright_green      = chalk.greenBright;
as.bright_yellow     = chalk.yellowBright;
as.bright_blue       = chalk.blueBright;
as.bright_magenta    = chalk.magentaBright;
as.bright_cyan       = chalk.cyanBright;
as.bright_white      = chalk.whiteBright;

as.bg_black          = chalk.bgBlack;
as.bg_red            = chalk.bgRed;
as.bg_green          = chalk.bgGreen;
as.bg_yellow         = chalk.bgYellow;
as.bg_blue           = chalk.bgBlue;
as.bg_magenta        = chalk.bgMagenta;
as.bg_cyan           = chalk.bgCyan;
as.bg_white          = chalk.bgWhite;

as.bg_bright_black   = chalk.bgBlackBright;
as.bg_bright_red     = chalk.bgRedBright;
as.bg_bright_green   = chalk.bgGreenBright;
as.bg_bright_yellow  = chalk.bgYellowBright;
as.bg_bright_blue    = chalk.bgBlueBright;
as.bg_bright_magenta = chalk.bgMagentaBright;
as.bg_bright_cyan    = chalk.bgCyanBright;
as.bg_bright_white   = chalk.bgWhiteBright;

////////////////////
as.noop = chalk;

const style = {
    below: as.red,
    above: as.green,
    equal: as.noop,
};

const istyle = {
    below: as.green,
    above: as.red,
    equal: as.noop,
};

function _not_in(low, high, x, style, custom) {
    var s = Object.assign(Object.assign({}, style), custom);
    return x < low ? s.below : x > high ? s.above : s.equal;
};

as.not_in = (low, high, x, custom) =>
    _not_in(low, high, x, style, custom);
as.inot_in = (low, high, x, custom) =>
    _not_in(low, high, x, istyle, custom);

as.comp_to = (y, x, custom) => _not_in(y, y, x, style, custom);
as.icomp_to = (y, x, custom) => _not_in(y, y, x, istyle, custom);

as.comp_to_0 = (x, custom) => as.comp_to(0, x, custom);
as.icomp_to_0 = (x, custom) => as.comp_to(0, x, custom);

////////////////////
as.asset  = (symbol) => as.cyan(symbol.asset);
as.money  = (symbol) => as.magenta(symbol.money);
as.symbol = (symbol) => as.asset(symbol) + '/' + as.money(symbol);

////////////////////
module.exports = as;
