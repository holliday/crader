'use strict';

const fs = require('fs');

////////////////////
global.root_require = name => require(__dirname + '/' + name);
global.lib_require = name => root_require('lib/' + name);

////////////////////
global.local_require = (type, name) => {
    if(typeof name === 'undefined') throw new Error('Unspecified ' + type);

    var path = type + '/' + name + '.js';
    try {
        fs.accessSync(path, fs.constants.R_OK);
    } catch(e) {
        throw new Error('Non-existent or inaccessible file ' + path);
    }
    return root_require(path);
}

