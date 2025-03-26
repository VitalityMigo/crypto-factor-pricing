// Script pour récupérer les données des marché spot de Coinbase et
// des fundings rates perpétuelles de Hyperliquid.

const fs = require('fs');
const path = require('path');
const { movingAverage } = require('./technicals');
const { timestampToDate, hourToAnnum } = require('./utils');

async function getPriceMA(asset) {
    const table = []

    // Paramètre de la requête
    let base_time = 1688169600
    const granularity = 86400
    const delta = granularity * 300

    // Définition du produit
    const product = asset === 'BTC' ? 'BTC-USD' : 'ETH-USD'

    while (true) {

        // Configuration de la requête
        const params = { granularity: granularity, start: base_time, end: base_time + delta };
        const config = { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        const url = `https://api.exchange.coinbase.com/products/${product}/candles?` +
            new URLSearchParams(params).toString();

        // Fetching des données
        const response = await fetch(url, config);
        const data = await response.json();
        const length = data.length;

        // Récupération de la data
        table.push(...data.map(row => ({ time: row[0], value: row[3] })).reverse());

        // Incrémentation de la plage d'observation
        base_time = table[table.length - 1].time + 1;

        // Break si dernière plage
        if (length < 300) { break }
    }

    // Calcul de l'évolution en pourcentage
    const percentageChangeTable = table.slice(1).map((row, index) => {
        const previousValue = table[index].value;
        const percentageChange = ((row.value - previousValue) / previousValue);
        return { time: row.time, value: percentageChange };
    });

    // Calcul de la moyenne mobile sur 7 jours
    const result = movingAverage(percentageChangeTable, 7).map(row => ({
        time: timestampToDate(row.time), price: row.value
    }));

    // Export des données en CSV
    const csv = ['date,sma', ...result.map(row => `${row.time},${row.price}`)].join('\n');
    const outputPath = path.join(__dirname, `../data/spot_daily_${asset}.csv`);
    fs.writeFileSync(outputPath, csv);

    console.log(`Données exportées dans ${outputPath}`);
}

async function getPriceMF(asset) {
    const table = []

    // Paramètre de la requête
    let base_time = 1741626000
    const granularity = 86400 / 24
    const delta = granularity * 300

    // Définition du produit
    const product = asset === 'BTC' ? 'BTC-USD' : 'ETH-USD'

    while (true) {

        // Configuration de la requête
        const params = { granularity: granularity, start: base_time, end: base_time + delta };
        const config = { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        const url = `https://api.exchange.coinbase.com/products/${product}/candles?` +
            new URLSearchParams(params).toString();

        // Fetching des données
        const response = await fetch(url, config);
        const data = await response.json();
        const length = data.length;

        // Récupération de la data
        table.push(...data.map(row => ({ time: row[0], value: row[3] })).reverse());

        // Incrémentation de la plage d'observation
        base_time = table[table.length - 1].time + 1;

        // Break si dernière plage
        if (length < 300) { break }
    }

    // Export des données en CSV
    const csv = ['date,sma', ...table.map(row => `${new Date(row.time * 1000).toISOString()},${row.value}`)].join('\n');
    const outputPath = path.join(__dirname, `../data/spot_hourly_${asset}.csv`);
    fs.writeFileSync(outputPath, csv);

    console.log(`Données exportées dans ${outputPath}`);
}

async function getPerpetualFundingMA(asset) {
    const table = [];
    const start_date = '2023-07-02';
    let base_time = 100;

    while (true) {

        // Configuration de la requête
        const body = JSON.stringify({ type: "fundingHistory", coin: asset, startTime: base_time });
        const config = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body };
        const url = `https://api.hyperliquid.xyz/info`;

        // Fetching des données
        const response = await fetch(url, config);
        const data = await response.json();
        const length = data.length;

        // Récupération de la date
        table.push(...data);

        // Incrémentation de la plage d'observation
        base_time = data[data.length - 1].time + 1;

        // Break si dernière plage
        if (length < 500) { break; }
    }

    // Transformer les données par heure en moyenne journalière
    const daily = Object.values(table.reduce((acc, { time, fundingRate }) => {
        const day = timestampToDate(time / 1000); // Convertir en YYYY-MM-DD
        acc[day] = acc[day] || { day, sum: 0, count: 0 };
        acc[day].sum += parseFloat(fundingRate); // Convertir fundingRate en nombre
        acc[day].count += 1;
        return acc;
    }, {})).map(({ day, sum, count }) => ({ time: day, value: hourToAnnum(sum / count) }))
        .filter(({ time }) => time >= start_date);

    // Calcul de la moyenne mobile sur 7 jours
    const result = movingAverage(daily, 7)

    // Export des données en CSV
    const csv = ['date,sma', ...result.map(row => `${row.time},${row.value}`)].join('\n');
    const outputPath = path.join(__dirname, `../data/funding_${asset}.csv`);
    fs.writeFileSync(outputPath, csv);

    console.log(`Données exportées dans ${outputPath}`);
}

async function getHistoricalVol(asset) {

    // Paramètre de la requête
    const base_time = 1688169600
    const now_time = Math.floor(new Date().getTime() / 1000)

    // Configuration de la requête
    const params = { currency: asset };
    const config = { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    const url = `https://deribit.com/api/v2/public/get_historical_volatility?` +
        new URLSearchParams(params).toString();

    // Fetching des données
    const response = await fetch(url, config);
    const data = await response.json();

    const table = data.result.map(row => ({
        time: new Date(row[0]).toISOString(),
        value: row[1] / 100
    }));

    // Export des données en CSV
    const csv = ['time,vol', ...table.map(row => `${row.time},${row.value}`)].join('\n');
    const outputPath = path.join(__dirname, `../data/volatility_${asset}.csv`);
    fs.writeFileSync(outputPath, csv);

    console.log(`Données exportées dans ${outputPath}`);
}
