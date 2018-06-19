'use strict';

const chalk   = require('chalk');
const moment  = require('moment');
const sprintf = require('sprintf-js').sprintf;
const is      = lib_require('is');

const as = {};

////////////////////
function _sprintf(mod, fmt, value) {
    if(is.num(value)) return sprintf(
        '%' + mod + fmt, Math.abs(value) < 0.000001 ? 0 : value

    ); else return sprintf(
        '%' + mod + parseInt(fmt) + 's', value
    );
}

as.date = (value, mod = '') => !isNaN(new Date(value))
    ? moment(value).format('YYYY-MM-DD HH:mm:ss')
    : _sprintf(mod, '19s', value);

as.fixed = (value, mod = '') => _sprintf(mod, '8.4f' , value);
as.int   = (value, mod = '') => _sprintf(mod, '8d'   , value);
as.num   = (value, mod = '') => _sprintf(mod, '7.4g' , value);
as.price = (value, mod = '') => _sprintf(mod, '8.7g' , value);
as.vol   = (value, mod = '') => _sprintf(mod, '10.9g', value);

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

as.below = (x, y, style) => x < y ? style : noop;
as.above = (x, y, style) => x > y ? style : noop;

const style = {
    below: as.red,
    above: as.green,
    equal: as.noop,
};

as.not_in = (x, low, high, override) => {
    var s = Object.assign(Object.assign({}, style), override);
    return x < low ? s.below : x > high ? s.above : s.equal;
};
as.comp_to = (x, y, override) => as.not_in(x, y, y, override);

////////////////////
as.asset  = (symbol) => as.cyan(symbol.asset);
as.money  = (symbol) => as.magenta(symbol.money);
as.symbol = (symbol) => as.asset(symbol) + '/' + as.money(symbol);

////////////////////
module.exports = as;
