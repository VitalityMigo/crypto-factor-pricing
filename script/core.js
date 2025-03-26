const path = require('path');
const math = require('mathjs');

const { parseCSV, randomName } = require('../script/utils.js');
const { crossCorrelation, compouteMMQuote, randomNormalValue } = require('../script/technicals.js');

function spotFundingCorrelation() {

    // Définition du lag pour la cross-corrélation
    const lag = 5

    // Bitcoin spot et funding correlation
    const btc_spot = parseCSV(path.join(__dirname, '../data/spot_daily_BTC.csv')).map(i => parseFloat(i.sma));
    const btc_funding = parseCSV(path.join(__dirname, '../data/funding_BTC.csv')).map(i => parseFloat(i.sma));
    const btc_cross_correl = crossCorrelation(btc_spot, btc_funding, lag);
    const btc_max_correl = btc_cross_correl.reduce((max, current) => Math.abs(current.correlation) > Math.abs(max.correlation) ? current : max);

    // Ether spot et funding correlation
    const eth_spot = parseCSV(path.join(__dirname, '../data/spot_daily_ETH.csv')).map(i => parseFloat(i.sma));
    const eth_funding = parseCSV(path.join(__dirname, '../data/funding_ETH.csv')).map(i => parseFloat(i.sma));
    const eth_cross_correlation = crossCorrelation(eth_spot, eth_funding, lag);
    const eth_max_correl = eth_cross_correlation.reduce((max, current) => Math.abs(current.correlation) > Math.abs(max.correlation) ? current : max);

    // Formattage du résultat
    const result = [
        { asset: 'BTC', correlation: btc_max_correl.correlation, lag: btc_max_correl.lag },
        { asset: 'ETH', correlation: eth_max_correl.correlation, lag: eth_max_correl.lag }
    ]

    return result
}


function simulateMMImpact(asset, num_market_makers) {

    // On récupère les données nescessaires
    const price_array = parseCSV(path.join(__dirname, `../data/spot_hourly_${asset}.csv`)).map(i => parseFloat(i.sma));
    const vol_array = parseCSV(path.join(__dirname, `../data/volatility_${asset}.csv`)).map(i => parseFloat(i.vol));

    // Liste des plus grands market makers de crypto-actifs (à titre illustratif)
    const list_MM = ['B2C2', 'GSR', 'Jump', 'Cumberland', 'Galaxy', 'Wintermute', 'QCP', 'Flow Traders'];

    const marketMakers = Array.from({ length: num_market_makers }, () => ({
        name: randomName(list_MM),
        inventory: randomNormalValue() // Inventaire initial
    }));

    // Résultat de la simulation
    const result = [];

    // Parcours des prix et volatilités heure par heure
    for (let i = 0; i < price_array.length; i++) {
        const midPrice = price_array[i];
        const volatility = vol_array[i];
        const hourlyQuotes = [];

        // Génération des quotes pour chaque market maker
        for (const marketMaker of marketMakers) {
            const inventory = randomNormalValue(); // Poids d'inventaire

            const quote = compouteMMQuote(midPrice, inventory, volatility);
            hourlyQuotes.push({
                marketMaker: marketMaker.name,
                inventory: marketMaker.inventory,
                volatility: volatility,
                ...quote
            });
        }

        // Calcul des meilleurs prix de cotations et étude de l'impact sur le mid
        const bestBid = Math.max(...hourlyQuotes.map(i => i.bid));
        const bestAsk = Math.min(...hourlyQuotes.map(i => i.ask));
        const market = {
            bestBid: bestBid,
            bestAsk: bestAsk,
            effectiveMid: math.mean([bestBid, bestAsk]),
            deviation: (math.mean([bestBid, bestAsk]) - midPrice) / midPrice
        }

        const summary = { session: i +1, market: market, quotes: hourlyQuotes }
        console.log(summary)
        mm
        result.push(summary);
    }

    return result;
}

module.exports = { spotFundingCorrelation, simulateMMImpact };
