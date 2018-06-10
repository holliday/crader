'use strict';

const _ = require('underscore');
const chalk = require('chalk');
const moment = require('moment');
const sprintf = require('sprintf-js').sprintf;

const show = {};

////////////////////
function _sprintf(mod, fmt, value) {
    return sprintf('%' + mod + (_.isNumber(value) ? fmt : parseInt(fmt) + 's'), value);
}

global.as_date = (value, mod = '') => !isNaN(new Date(value))
    ? moment(value).format('YYYY-MM-DD HH:mm:ss' + mod)
    : _sprintf(mod, '19s', value);

global.as_price = (value, mod = '') => _sprintf(mod, '8.7g' , value);
global.as_vol   = (value, mod = '') => _sprintf(mod, '10.9g', value);
global.as_int   = (value, mod = '') => _sprintf(mod, '8d'   , value);
global.as_num   = (value, mod = '') => _sprintf(mod, '7.4g' , value);
global.as_fixed = (value, mod = '') => _sprintf(mod, '8.4f' , value);

////////////////////
// chalk styles
global.bold              = chalk.bold;
global.dim               = chalk.dim;
global.italic            = chalk.italic;
global.underline         = chalk.underline;
global.inverse           = chalk.inverse;
global.hidden            = chalk.hidden;
global.strikethrough     = chalk.strikethrough;

global.black             = chalk.black;
global.red               = chalk.red;
global.green             = chalk.green;
global.yellow            = chalk.yellow;
global.blue              = chalk.blue;
global.magenta           = chalk.magenta;
global.cyan              = chalk.cyan;
global.white             = chalk.white;

global.gray              = chalk.gray;
global.bright_red        = chalk.redBright;
global.bright_green      = chalk.greenBright;
global.bright_yellow     = chalk.yellowBright;
global.bright_blue       = chalk.blueBright;
global.bright_magenta    = chalk.magentaBright;
global.bright_cyan       = chalk.cyanBright;
global.bright_white      = chalk.whiteBright;

global.bg_black          = chalk.bgBlack;
global.bg_red            = chalk.bgRed;
global.bg_green          = chalk.bgGreen;
global.bg_yellow         = chalk.bgYellow;
global.bg_blue           = chalk.bgBlue;
global.bg_magenta        = chalk.bgMagenta;
global.bg_cyan           = chalk.bgCyan;
global.bg_white          = chalk.bgWhite;

global.bg_bright_black   = chalk.bgBlackBright;
global.bg_bright_red     = chalk.bgRedBright;
global.bg_bright_green   = chalk.bgGreenBright;
global.bg_bright_yellow  = chalk.bgYellowBright;
global.bg_bright_blue    = chalk.bgBlueBright;
global.bg_bright_magenta = chalk.bgMagentaBright;
global.bg_bright_cyan    = chalk.bgCyanBright;
global.bg_bright_white   = chalk.bgWhiteBright;

////////////////////
global.comp_to = (x, y) => x > y ? green : x < y ? red : white;
global.icomp_to = (x, y) => x > y ? bg_green : x < y ? bg_red : white;

global.comp_to_0 = x => comp_to(x, 0);
global.icomp_to_0 = x => icomp_to(x, 0);

////////////////////
const esc = '\u001b[';
const out = process.stdout;

// cursor
global.move_up      = n => out.write(esc + (_.isNumber(n) ? n : '') + 'A');
global.move_down    = n => out.write(esc + (_.isNumber(n) ? n : '') + 'B');
global.move_forward = n => out.write(esc + (_.isNumber(n) ? n : '') + 'C');
global.move_back    = n => out.write(esc + (_.isNumber(n) ? n : '') + 'D');

global.move_next    = n => out.write(esc + (_.isNumber(n) ? n : '') + 'E');
global.move_prev    = n => out.write(esc + (_.isNumber(n) ? n : '') + 'F');

global.move_to = (x, y) => {
    out.write(esc + (_.isNumber(y) ? y+1 : '') + ';' + (_.isNumber(x) ? x+1 : '') + 'H');
};

global.move = (x, y) => {
    if(x > 0) move_forward(x);
    else if(x < 0) move_back(-x);

    if(y > 0) move_down(y);
    else if(y < 0) move_up(y);
};

global.save_pos    = () => out.write(esc + 's');
global.restore_pos = () => out.write(esc + 'u');

// screen
global.erase_up    = () => out.write(esc + '1J');
global.erase_down  = () => out.write(esc + '0J');
global.erase_all   = () => out.write(esc + '2J');

// line
global.erase_begin = () => out.write(esc + '1K');
global.erase_end   = () => out.write(esc + '0K');
global.erase_line  = () => out.write(esc + '2K');

// screen
global.scroll_up   = n => out.write(esc + (_.isNumber(n) ? n : '') + 'S');
global.scroll_down = n => out.write(esc + (_.isNumber(n) ? n : '') + 'T');

////////////////////
module.exports = show;
