'use strict';

const _ = require('underscore');
const chalk = require('chalk');

////////////////////
class Table {
    constructor() {
        this.cells = {};
    }

    add_column(name, fmt, ...style) {
        var _style = [ ...style ];

        this.cells[name] = {
            fmt: fmt,
            mod: _.isString(_style[0]) ? _style.shift() : '',
            style: _style,
        };
    }

    print_line(...values) {
        var _values = [ ...values ], idx = 0;

        var cells = [];
        for(var name in this.cells) {
            if(idx >= _values.length) break;

            var cell = this.cells[name];
            var value = cell.fmt(_values[idx], cell.mod);

            cell.style.forEach(style => value = style(value));
            cells.push(value);

            idx++;
        }

        console.log(...cells);
    }

    print_head() {
        this.print_line(...Object.keys(this.cells));
    }

    with(names, ...style) {
        var _names = names === '*'
            ? Object.keys(this.cells)
            : [].concat(names);

        var table = new Table();
        for(var name in this.cells) {
            var cell = this.cells[name];
            table.cells[name] = {
                fmt: cell.fmt,
                mod: cell.mod,
                style: cell.style.slice(),
            };
        }

        _names.forEach(name => {
            if(name in table.cells)
                table.cells[name].style.unshift(...style);
        });
        return table;
    }
}

////////////////////
module.exports = Table;
