const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'rifa.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    num     INTEGER PRIMARY KEY,
    name    TEXT    NOT NULL,
    phone   TEXT    DEFAULT '',
    note    TEXT    DEFAULT '',
    paid    INTEGER DEFAULT 0,
    date    TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sorteo_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    num         INTEGER NOT NULL,
    buyer_name  TEXT,
    buyer_phone TEXT,
    drawn_at    TEXT    NOT NULL
  );
`);

module.exports = db;
