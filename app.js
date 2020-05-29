const fs = require("fs");
const ComboCleaner = require('./combo-cleaner')
const AntiReChecker = require("./anti-rechecker")

let combo = fs.readFileSync("./combo.txt").toString().split(/\r?\n/);
ComboCleaner(combo);
combo = AntiReChecker(combo)
combo = combo.join('\n');
fs.appendFileSync("./good-combo.txt", combo); 