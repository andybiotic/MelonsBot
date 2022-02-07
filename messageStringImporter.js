const fs = require('fs');
const os = require('os');

function importStrings() {
    const file = [os.homedir, "/MelonsBot/paddockmessages.txt"];
    const fileWithPath = file.join("");

    try {  
        var data = fs.readFileSync(fileWithPath, 'utf8');
        const text = data.split(/\r?\n/);
        return text
    } catch(error) {
        console.log("Error importing paddock messages");
    }
}

module.exports = { importStrings }

