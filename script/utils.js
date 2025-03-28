const fs = require('fs');
const colors = require("colors");
const Table = require("cli-table3");

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

function timestampToDate(timestamp) {
    const date = new Date(timestamp); // Convertir le timestamp en millisecondes
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois de 0 à 11
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function displayMarketDashboard(data) {

    // Effacer la console
    console.clear(); 

    console.log(colors.bold("\n=== MARKET MAKING SIMULATION ===\n"));

    console.log(colors.blue(`Session: ${timestampToDate(data.time)}`));
    console.log(`• Prix du marché: ${data.market.effectiveMid.toFixed(2)}`);
    console.log(`• Volatilité: ${data.quotes[0].volatility.toFixed(2)}`); 
    console.log("\n");

    // 📌 Tableau des market makers
    const quotesTable = new Table({
        head: [
            colors.bold(colors.blue("Market Maker")),
            colors.bold(colors.blue("Inventaire")),
            colors.bold(colors.blue("Bid")),
            colors.bold(colors.blue("Mid")),
            colors.bold(colors.blue("Ask")),
            colors.bold(colors.blue("Spread")),
            colors.bold(colors.blue("Skew"))
        ],
        colWidths: [16, 12, 15, 15, 15, 10, 10]
    });

    data.quotes.forEach((mm) => {
        quotesTable.push([
            colors.bold(mm.marketMaker),
            mm.inventory.toFixed(2),
            colors.green(mm.bid.toFixed(2)),
            colors.yellow(mm.mid.toFixed(2)),
            colors.red(mm.ask.toFixed(2)),
            mm.spread.toFixed(2),
            mm.skew.toFixed(2)
        ]);
    });

    console.log(colors.blue("Tableau des cotations des market makers:"));
    console.log(quotesTable.toString());

    // 📌 Marché agrégé
    const aggTable = new Table({
        head: [
            colors.bold(colors.blue("Bid")),
            colors.bold(colors.blue("Prix Effectif")),
            colors.bold(colors.blue("Ask")),
        ],
        colWidths: [15, 15, 15]
    });

    aggTable.push([
        colors.green(data.market.bestBid.toFixed(2)),
        colors.yellow(data.market.effectiveMid.toFixed(2)),
        colors.red(data.market.bestAsk.toFixed(2))
    ]);

    console.log(colors.blue("\nMarchés agrégés:"));
    console.log(aggTable.toString());

    console.log("∟ Déviation: " + (data.market.deviation > 0 
        ? colors.green(data.market.deviation.toFixed(2)) 
        : colors.red(data.market.deviation.toFixed(2))) + " bps");
    console.log("\n");
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms * 1000));
}

module.exports = { timestampToDate, hourToAnnum, parseCSV, sleep, randomName, displayMarketDashboard }