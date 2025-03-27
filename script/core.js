const path = require('path');
const math = require('mathjs');

const { parseCSV, randomName } = require('../script/utils.js');
const { crossCorrelation, computeMMQuote, randomNormalValue } = require('../script/technicals.js');

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

    const marketMakers = randomName(num_market_makers)

    // Résultat de la simulation
    const result = [];

    // Parcours des prix et volatilités heure par heure
    for (let i = 0; i < price_array.length; i++) {

        const midPrice = price_array[i];
        const volatility = vol_array[i];
        const quotes = [];

        // Génération des quotes pour chaque market maker
        for (const marketMaker of marketMakers) {

            const inventory = randomNormalValue(); // Poids d'inventaire
            const quote = computeMMQuote(midPrice, inventory, volatility);

            quotes.push({
                marketMaker: marketMaker.name, inventory: inventory,
                volatility: volatility, ...quote
            });
        }

        // Calcul des meilleurs prix de cotations et étude de l'impact sur le mid
        const bestBid = Math.max(...quotes.map(i => i.bid));
        const bestAsk = Math.min(...quotes.map(i => i.ask));
        const effectiveMid = math.mean([bestBid, bestAsk])
        const deviation = (effectiveMid - midPrice) / midPrice * 10000

        const market = {
            bestBid: bestBid, bestAsk: bestAsk,  effectiveMid: effectiveMid, deviation: deviation
        }

        const summary = { session: i + 1, market: market, quotes: quotes }
        console.log(summary)
        result.push(summary);
    }

    return result;
}

module.exports = { spotFundingCorrelation, simulateMMImpact };
