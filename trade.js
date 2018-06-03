'use strict';

var meow = require('meow');
var path = require('path');
require('manakin').global; // color console

var common = require('./common');

////////////////////
function read_args() {
    var node = path.parse(process.argv[0]).base;
    var name = path.parse(process.argv[1]).base;
    var args = meow({
        flags: {
            help: {
                type: 'boolean',
                alias: 'h',
            },
            version: {
                type: 'boolean',
                alias: 'v',
            },
        },
        help:
`
Usage: ${node} ${name} [option] <conf>...

Where [option] is one of:
    -h, --help           Show this help screen
    -v, --version        Show version

and <conf> is one or more conf files to use.
`
    });
    return args;
}

////////////////////
function read_conf(paths) {
    var conf = { };

    if(typeof paths !== 'undefined') {
        [].concat(paths).forEach(path => {
            if(!path.startsWith('.') && !path.startsWith('/')) path = './' + path
            Object.assign(conf, require(path));
        });
    }

    return conf;
}

////////////////////
var args = read_args();
common.banner();

var conf = read_conf(args.input);
console.log("Merged conf:", conf);
