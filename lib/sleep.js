'use strict';

const sleep = {};

////////////////////
sleep.for = interval => new Promise(resolve => setTimeout(resolve, interval));
sleep.until = date => sleep.for(date - Date.now());

////////////////////
module.exports = sleep;
