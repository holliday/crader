'use strict';

const _ = require('underscore');
const chalk = require('chalk');
const moment = require('moment');
const sprintf = require('sprintf-js').sprintf;

const show = {};

////////////////////
global.as_date = (value, frac) => moment(value).format(
    'YYYY-MM-DD HH:mm:ss' + (frac ? '.SSS' : '')
);

////////////////////
global.fmt = (...args) => sprintf(...args);

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
const esc = '\u001b[';
const out = process.stdout;

// cursor
show.move_up      = n => out.write(esc + (_.isNumber(n) ? n : '') + 'A');
show.move_down    = n => out.write(esc + (_.isNumber(n) ? n : '') + 'B');
show.move_forward = n => out.write(esc + (_.isNumber(n) ? n : '') + 'C');
show.move_back    = n => out.write(esc + (_.isNumber(n) ? n : '') + 'D');

show.move_next    = n => out.write(esc + (_.isNumber(n) ? n : '') + 'E');
show.move_prev    = n => out.write(esc + (_.isNumber(n) ? n : '') + 'F');

show.move_to = (x, y) => {
    out.write(esc + (_.isNumber(y) ? y+1 : '') + ';' + (_.isNumber(x) ? x+1 : '') + 'H');
};

show.move = (x, y) => {
    if(x > 0) show.move_forward(x);
    else if(x < 0) show.move_back(-x);

    if(y > 0) show.move_down(y);
    else if(y < 0) show.move_up(y);
};

show.save_pos    = () => out.write(esc + 's');
show.restore_pos = () => out.write(esc + 'u');

// screen
show.erase_up    = () => out.write(esc + '1J');
show.erase_down  = () => out.write(esc + '0J');
show.erase_all   = () => out.write(esc + '2J');

// line
show.erase_begin = () => out.write(esc + '1K');
show.erase_end   = () => out.write(esc + '0K');
show.erase_line  = () => out.write(esc + '2K');

// screen
show.scroll_up   = n => out.write(esc + (_.isNumber(n) ? n : '') + 'S');
show.scroll_down = n => out.write(esc + (_.isNumber(n) ? n : '') + 'T');

////////////////////
module.exports = show;
