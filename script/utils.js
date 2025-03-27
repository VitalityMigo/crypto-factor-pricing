const fs = require('fs');

function timestampToDate(timestamp) {
    return new Date(timestamp * 1000).toISOString().split('T')[0]
}

function hourToAnnum(value) {
    return value * 24 * 365
}

function parseCSV(filePath) {
    const csvData = fs.readFileSync(filePath, 'utf8');
    const [headerLine, ...lines] = csvData.split('\n').filter(line => line.trim() !== '');
    const headers = headerLine.split(',');

    return lines.map(line => {
        const values = line.split(',');
        return headers.reduce((acc, header, index) => {
            acc[header] = values[index];
            return acc;
        }, {});
    });
}

// Fonction pour choisir un nom unique au hasard dans la liste
function randomName(x = 3) {
    const list_MM = ['B2C2', 'GSR', 'Jump', 'Cumberland', 'Galaxy', 'Wintermute', 'QCP', 'Flow Traders'];
    return [...list_MM]
        .sort(() => Math.random() - 0.5) // Mélange aléatoire
        .slice(0, x) // Prend les x premiers
        .map(name => ({ name })); // Transforme en objets
}

module.exports = { timestampToDate, hourToAnnum, parseCSV, randomName };