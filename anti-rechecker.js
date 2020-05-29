const fs = require("fs-extra");

let count = 0;
module.exports = combo => {
    return combo.filter(line => {
        count++;
        if(count % 1000 == 0){
            console.log(count);
        }

        //split line by "@"
        let domain = line.split(":")[0].split("@")[1];
        let folder = line.charAt(0);
        let subFolder = line.charAt(1);
        let file = line.charAt(2);

        if (folder === ".") {
            folder = "dot"
        } else if (!isValidFolderName(folder)) {
            folder = "special"
        }

        if (subFolder === ".") {
            subFolder = "dot"
        } else if (!isValidFolderName(subFolder)) {
            subFolder = "special"
        }

        if (file === ".") {
            file = "dot"
        } else if (!isValidFolderName(file)) {
            file = "special"
        }
		
		if (domain.indexOf('gmx') > -1) {
			domain = 'gmx';
		}

		if (domain !== 'hotmail.com' && domain !== 'yahoo.com' && domain !== 'msn.com' &&
			domain !== 'cox.net' && domain !== 'comcast.net' && domain !== 'freenet.de' &&
			domain !== 'freemail.hu' && domain !== 'juno.com' && domain !== 'caramail.com' &&
			domain !== 'mail.com' && domain !== 't-online.de' && domain !== 'gmx' &&
			domain !== 'free.fr' && domain !== 'email.com') {
				domain = "other";
		}

        let dir = `./database/${domain}/${folder}/${subFolder}`

        fs.ensureDirSync(dir);

        try {
            var set = fs.readFileSync(`${dir}/${file}.txt`).toString().split("\n");
            set = new Set(set)
        } catch (err) {
            set = new Set();
        }

        if (set.has(line)) {
            return false;
        }

        try {
            fs.appendFileSync(`${dir}/${file}.txt`, line + "\n")
        } catch (err) {
        }

        return true;
    });
}

function isValidFolderName(str) {
    return !/[\\/:*?"<>|]/g.test(str);
}
