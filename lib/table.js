'use strict';

const is = lib_require('is');

////////////////////
class Table {
    constructor() {
        this.cells = {};
    }

    add_column(name, fmt, ...style) {
        this.cells[name] = {
            fmt: fmt,
            mod: is.string(style[0]) ? style.shift() : '',
            style: style,
        };
    }

    print_line(...value) {
        var values = value;
        if(value.length === 1) {
                 if(is.array (value[0])) values = value[0];
            else if(is.object(value[0])) values = Object.values(value[0]);
        }

        var n = 0, cells = [];
        for(var name in this.cells) {
            if(n >= values.length) break;

            var cell = this.cells[name];
            var value = cell.fmt(values[n], cell.mod);

            cell.style.forEach(style => value = style(value));
            cells.push(value);

            n++;
        }

        console.log(...cells);
    }

    print_head() {
        this.print_line(...Object.keys(this.cells));
    }

    with(names, ...style) {
        if(names === '*') names = Object.keys(this.cells);
        else names = [].concat(names);

        var table = new Table();
        for(var name in this.cells) {
            var cell = this.cells[name];
            table.cells[name] = {
                fmt: cell.fmt,
                mod: cell.mod,
                style: cell.style.slice(),
            };
        }

        names.forEach(name => {
            if(name in table.cells)
                table.cells[name].style.unshift(...style);
        });
        return table;
    }
}

////////////////////
module.exports = Table;
