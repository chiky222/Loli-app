const fs   = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'data.json');

const DEFAULTS = { tickets: {}, sorteo: [] };

function read(){
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch(e) {
    return JSON.parse(JSON.stringify(DEFAULTS));
  }
}

function write(data){
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { read, write };
