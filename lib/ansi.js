'use strict';

const ansi = {};

////////////////////
const esc = '\u001b[';
const out = process.stdout;

// cursor
ansi.move_up      = n => out.write(esc + (is_num(n) ? n : '') + 'A');
ansi.move_down    = n => out.write(esc + (is_num(n) ? n : '') + 'B');
ansi.move_forward = n => out.write(esc + (is_num(n) ? n : '') + 'C');
ansi.move_back    = n => out.write(esc + (is_num(n) ? n : '') + 'D');

ansi.move_next    = n => out.write(esc + (is_num(n) ? n : '') + 'E');
ansi.move_prev    = n => out.write(esc + (is_num(n) ? n : '') + 'F');

ansi.move_to = (x, y) => {
    out.write(esc + (is_num(y) ? y+1 : '') + ';' + (is_num(x) ? x+1 : '') + 'H');
};

ansi.move = (x, y) => {
    if(x > 0) ansi.move_forward(x);
    else if(x < 0) ansi.move_back(-x);

    if(y > 0) ansi.move_down(y);
    else if(y < 0) ansi.move_up(y);
};

ansi.save_pos    = () => out.write(esc + 's');
ansi.restore_pos = () => out.write(esc + 'u');

// screen
ansi.erase_up    = () => out.write(esc + '1J');
ansi.erase_down  = () => out.write(esc + '0J');
ansi.erase_all   = () => out.write(esc + '2J');

// line
ansi.erase_begin = () => out.write(esc + '1K');
ansi.erase_end   = () => out.write(esc + '0K');
ansi.erase_line  = () => out.write(esc + '2K');

// screen
ansi.scroll_up   = n => out.write(esc + (is_num(n) ? n : '') + 'S');
ansi.scroll_down = n => out.write(esc + (is_num(n) ? n : '') + 'T');

////////////////////
module.exports = ansi;
