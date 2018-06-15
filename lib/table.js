'use strict';

////////////////////
class Table {
    constructor() {
        this.cells = {};
    }

    add_column(name, fmt, ...style) {
        var _style = [ ...style ];

        this.cells[name] = {
            fmt: fmt,
            mod: is_string(_style[0]) ? _style.shift() : '',
            style: _style,
        };
    }

    print_line(...value) {
        var values;
             if(value.length === 1 && is_array (value[0])) values = value[0];
        else if(value.length === 1 && is_object(value[0])) values = Object.values(value[0]);
        else values = value;

        var idx = 0, cells = [];
        for(var name in this.cells) {
            if(idx >= values.length) break;

            var cell = this.cells[name];
            var value = cell.fmt(values[idx], cell.mod);

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
