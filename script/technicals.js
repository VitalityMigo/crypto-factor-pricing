const math = require('mathjs');

function movingAverage(data, range) {
    // Calcul de la moyenne mobile sur 3 jours, ou SMA(3)
    const movingAverage = [];
    for (let i = 0; i <= data.length - range; i++) {
        const window = data.slice(i, i + range);
        const avgPrice = window.reduce((sum, entry) => sum + entry.value, 0) / range;
        movingAverage.push({ time: window[range - 1].time, value: avgPrice });
    }
    return movingAverage;
}

function pearsonCorrelation(x, y) {
    if (x.length !== y.length) {
        throw new Error("Les tableaux doivent avoir la même longueur.");
    }

    let meanX = math.mean(x);
    let meanY = math.mean(y);

    let numerator = math.sum(x.map((xi, i) => (xi - meanX) * (y[i] - meanY)));
    let denominator = math.sqrt(math.sum(x.map(xi => Math.pow(xi - meanX, 2))) *
        math.sum(y.map(yi => Math.pow(yi - meanY, 2))));

    return denominator === 0 ? 0 : numerator / denominator;
}

function crossCorrelation(x, y, maxLag) {
    let correlations = [];
    for (let lag = -maxLag; lag <= maxLag; lag++) {
        let xLagged = x.slice(Math.max(0, -lag), x.length - Math.max(0, lag));
        let yLagged = y.slice(Math.max(0, lag), y.length - Math.max(0, -lag));
        correlations.push({ lag, correlation: pearsonCorrelation(xLagged, yLagged) });
    }
    return correlations;
}


/**
 * Méthode de cotation dynamique couramment employée, dérivant des travaux de Avellaneda et Stoikov (2008).
 * @param {number} midPrice - Le prix médian.
 * @param {number} inventory - L'inventaire, exprimé sur la plage -100 à 100.
 * @param {number} sigma - La volatilité annualisée sur 365 jours (σ).
 * @param {number} gamma - Le paramètre de risque (γ), estimé par rapport à la liqudité du marché.
 * @param {number} T - L'horizon en jours (par défaut 0.05, environ 72 minutes).
 * @returns {object} Un objet contenant : mid, bid, ask, spread_bps, et skew_percent.
 */
function computeMMQuote(midPrice, inventory, sigma, gamma = 75, T = 1 / 24) {
    // Conversion de la volatilité annualisée en volatilité quotidienne
    const volatilityDaily = sigma / math.sqrt(365);
    const sigmaDailySquared = math.pow(volatilityDaily, 2);

    // Calcul du half-spread (spread de base)
    const deltaBase = (gamma * sigmaDailySquared * T) / 2;

    // Correction du spread minimal (0.1 bps)
    const minimalHalfSpread = math.max(0.000005, deltaBase); // 0.1 bps minimum
    const halfSpread = math.max(deltaBase, minimalHalfSpread);

    // Skew linéaire proportionnel au spread
    const deltaSkew = (inventory / 100) * halfSpread;

    // Calcul des prix bid et ask
    const bidPrice = midPrice * (1 - (halfSpread + deltaSkew));
    const askPrice = midPrice * (1 + (halfSpread - deltaSkew));

    // Calcul du spread total en pourcentage et conversion en bps
    const spreadPct = 2 * halfSpread;
    const spread_bps = spreadPct * 10000;

    // Calcul du skew en pourcentage
    const skew_percent = (inventory / 100) * 100; // 100% quand inventaire = ±100

    return {
        mid: midPrice,
        bid: bidPrice,
        ask: askPrice,
        spread: askPrice - bidPrice,
        spread_bps: spread_bps,
        skew: skew_percent,
        dev: (askPrice + bidPrice) / 2 
    };
}

// === TESTS ===
console.log("Inventaire neutre:", computeMMQuote(1000, -30, 0.5));

function randomNormalValue(mean = 0, stdDev = 50) {
    let u1 = 0, u2 = 0;
    // Générer deux nombres aléatoires uniformes dans (0, 1)
    while (u1 === 0) u1 = math.random();
    while (u2 === 0) u2 = math.random();
    // Transformation Box-Muller
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const value = z0 * stdDev + mean;
    // Limiter la valeur entre -100 et 100
    return Math.max(-100, Math.min(100, value));
}

module.exports = { movingAverage, crossCorrelation, computeMMQuote, randomNormalValue };