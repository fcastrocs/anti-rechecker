const fs = require('fs')
const REX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

let tlds = fs.readFileSync('./tlds.txt').toString().split(/\r?\n/);
let filters = fs.readFileSync('./filters.txt').toString().split(/\r?\n/);

//global variables
let badLines = new Array();
let filteredCombos = new Array();
let badEmails = new Array();
let notDotComEmails = new Array();
let nonASCIILines = new Array();

// stats
let totalLines = 0;
let totalBadLines = 0;
let totalFilteredLines = 0;
let totalDuplicateLines = 0;


//Read all combos
module.exports = combo => {
    totalLines += combo.length;
    combo = FilterCombo(combo);
    combo = RemoveDuplicates(combo);

    badLines = badLines.join('\n');
    fs.appendFileSync(`./bad/badlines.txt`, badLines);
    badLines = [];
    badEmails = badEmails.join('\n');
    fs.appendFileSync(`./bad/bad-emails.txt`, badEmails);
    badEmails = [];
    filteredCombos = filteredCombos.join('\n');
    fs.appendFileSync(`./bad/filtered-lines.txt`, filteredCombos);
    filteredCombos = [];
    notDotComEmails = notDotComEmails.join('\n');
    fs.appendFileSync(`./bad/non-dotcom-emails.txt`, notDotComEmails);
    notDotComEmails = [];
    nonASCIILines = nonASCIILines.join('\n');
    fs.appendFileSync(`./bad/non-ascii.txt`, nonASCIILines);
    nonASCIILines = [];

    //print stats
    console.log('---COMBO CLEANER---');
    console.log(`Total lines: ${totalLines}`);
    console.log(`Bad lines: ${totalBadLines}`);
    console.log(`Filtered lines: ${totalFilteredLines}`)
    console.log(`Duplicate lines: ${totalDuplicateLines}`);
    let totalGood = totalLines - totalBadLines - totalFilteredLines - totalDuplicateLines;
    console.log(`Good lines: ${totalGood}`);
    console.log('\n');

    return combo;
}

function FilterCombo(combo) {
    return combo.reduce((filtered, line) => {
        // Using filters.txt
        line = line.trim();

        //Allow only 7-bit ASCII
        if (!isASCII(line)) {
            totalBadLines++;
            nonASCIILines.push(line);
            return filtered;
        }

        //replace ';' with ':'
        line = line.replace(/;/g, ':');

        //at this time all lines must have a ':'
        if (line.indexOf(':') == -1) {
            totalBadLines++;
            badLines.push(line);
            return filtered;
        }

        //make username lowercase
        let comboSplit = line.split(':');
        let email = comboSplit[0].toLowerCase();
        let password = comboSplit[1];

        line = `${email}:${password}`;

        //filter combos if it has no email or no pass or hashed...
        if (!email || !password || password.length >= 32 || email.length >= 40) {
            totalBadLines++;
            badLines.push(line);
            return filtered;
        }

        //filter non valid emails
        let match = REX.test(email);
        if (!match) {
            totalBadLines++;
            badLines.push(line);
            return filtered;
        }

        //split email by user and domain
        let domain = "@" + email.split("@")[1] + ":";

        //filter combos with a large domain name
        if (domain.length >= 36) {
            totalBadLines++;
            badLines.push(line);
            return filtered;
        }

        //check if combo should be filtered, based on filters list
        for (let i = 0; i < filters.length; i++) {
            if (domain.indexOf(filters[i]) > -1) {
                totalFilteredLines++;
                filteredCombos.push(line)
                return filtered;
            }
        }
		
		//check if combo should be filtered, based on bad tld
        let goodTld = false;
		for (let i = 0; i < tlds.length; i++) {
            if (domain.indexOf(tlds[i]) > -1) {
               goodTld = true;
			   break;
            }
        }
		
		if(!goodTld){
			totalFilteredLines++;
			filteredCombos.push(line)
			return filtered;
		}

        // Remove lines hotmail and yahoo with domain extension not .com
        if (domain.indexOf("hotmail") > -1 || domain.indexOf("yahoo") > -1 || domain.indexOf("aol") > -1 || domain.indexOf("msn") > -1) {
			if(domain !== "@hotmail.com:" && domain !== "@yahoo.com:" && domain !== "@aol.com:" && domain !== "@msn.com:"){
				totalFilteredLines++;
                notDotComEmails.push(line)
                return filtered;
			}
        }

        // good combo
        filtered.push(line);
        return filtered;
    }, []);
}

function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

function RemoveDuplicates(combo) {
    let oldLength = combo.length;
    combo = Array.from(new Set(combo));
    totalDuplicateLines += (oldLength - combo.length)
    return combo;
}