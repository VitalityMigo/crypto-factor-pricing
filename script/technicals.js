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

module.exports = { movingAverage, pearsonCorrelation, crossCorrelation };