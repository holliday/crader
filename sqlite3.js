'use strict';

const Database = require('better-sqlite3');

Database.prototype.begin    = function() { this.prepare('BEGIN'   ).run(); }
Database.prototype.commit   = function() { this.prepare('COMMIT'  ).run(); }
Database.prototype.rollback = function() { this.prepare('ROLLBACK').run(); }

module.exports = Database;
