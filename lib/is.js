'use strict';

const is = {};

////////////////////
is.undef  = value => typeof value === 'undefined';
is.def    = value => typeof value !== 'undefined';

is.array  = value => Array.isArray(value);
is.num    = value => typeof value === 'number';
is.object = value => typeof value === 'object';
is.string = value => typeof value === 'string';

////////////////////
module.exports = is;
