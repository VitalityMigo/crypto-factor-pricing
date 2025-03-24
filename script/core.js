const path = require('path');
const { parseCSV } = require('../script/utils.js');
const { crossCorrelation } = require('../script/technicals.js');

function spotFundingCorrelation() {

    // Définition du lag pour la cross-corrélation
    const lag = 5

    // Bitcoin spot et funding correlation
    const btc_spot = parseCSV(path.join(__dirname, '../data/spot_BTC.csv')).map(i => parseFloat(i.sma));
    const btc_funding = parseCSV(path.join(__dirname, '../data/funding_BTC.csv')).map(i => parseFloat(i.sma));
    const btc_cross_correl = crossCorrelation(btc_spot, btc_funding, lag);
    const btc_max_correl = btc_cross_correl.reduce((max, current) => Math.abs(current.correlation) > Math.abs(max.correlation) ? current : max);
    
    // Ether spot et funding correlation
    const eth_spot = parseCSV(path.join(__dirname, '../data/spot_ETH.csv')).map(i => parseFloat(i.sma));
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

module.exports = {spotFundingCorrelation};
