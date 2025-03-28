const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function plotSpotFunding(asset, spot, funding) {
    // Traces pour le graphique
    const spotTrace = {
        x: spot.map(row => row.date), // Utiliser les dates pour l'axe des x
        y: spot.map(row => row.sma),
        mode: 'lines',
        line: { color: '#3478B3', width: 3 }, // Ligne bleue légèrement plus épaisse et plus visible
        name: `Prix au comptant`,
        yaxis: 'y1' // Associer au premier axe Y
    };

    const fundingTrace = {
        x: funding.map(row => row.date), // Utiliser les dates pour l'axe des x
        y: funding.map(row => row.sma),
        mode: 'lines',
        line: { color: '#A1A1A1', width: 2.5 }, // Ligne grise légèrement plus épaisse
        name: `Taux de financement`,
        yaxis: 'y2' // Associer au deuxième axe Y
    };

    // Mise en page du graphique
    const layout = {
        title: {
            text: `Prix au comptant vs Taux de financement de l'ETH`,
            font: { family: 'Times New Roman, serif', size: 18, color: 'black' }
        },
        xaxis: {
            title: { text: 'Time', font: { family: 'Times New Roman, serif', size: 18, color: 'black' } }, // Taille réduite
            showgrid: false, // Désactiver la grille
            zeroline: false,
            linecolor: 'black',
            linewidth: 2,
            mirror: true
        },
        yaxis: {
            title: { text: 'Prix au comptant', font: { family: 'Times New Roman, serif', size: 18, color: 'black' } }, // Taille réduite
            showgrid: false, // Désactiver la grille
            zeroline: false,
            linecolor: 'black',
            linewidth: 2,
            mirror: true,
            overlaying: 'y2', // Superposer sur le deuxième axe Y
        },
        yaxis2: {
            title: { text: 'Taux de financement', font: { family: 'Times New Roman, serif', size: 18, color: 'black' } }, // Taille réduite
            side: 'right', // Positionner à droite
            showgrid: false, // Désactiver la grille
            zeroline: false,
            linecolor: 'black',
            linewidth: 2,
            
        },
        shapes: [
            {
                type: 'line',
                x0: 0,
                x1: 1,
                y0: 0,
                y1: 0,
                xref: 'paper',
                yref: 'y',
                line: {
                    color: '#000000', // Ligne du zéro légèrement plus foncée
                    width: 0.3, // Ligne légèrement plus épaisse
                    dash: 'solid'
                },
                layer: 'below', // Place sous les courbes
            }
        ],
        legend: {
            x: 0.02,
            y: 0.985,
            font: { family: 'Times New Roman, serif', size: 18, color: 'black' }
        },
        plot_bgcolor: 'rgba(0,0,0,0)', // Fond transparent
        paper_bgcolor: 'rgba(0,0,0,0)', // Fond transparent
        margin: { l: 80, r: 80, t: 50, b: 50 }
    };

    // Générer le fichier HTML avec Plotly.js
    const htmlContent = `
    <html>
    <head>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    </head>
    <body>
        <div id="chart" style="width:1600px;height:600px;"></div>
        <script>
            Plotly.newPlot('chart', ${JSON.stringify([fundingTrace, spotTrace])}, ${JSON.stringify(layout)}); // Ordre : grid < ligne 0 < funding < price
        </script>
    </body>
    </html>`;

    const graphDir = path.resolve('./graph');
    const htmlFilePath = path.join(graphDir, 'chart.html');
    const outputFile = path.join(graphDir, `spot_funding_${asset}.png`);

    // Vérifier et créer le dossier 'graph' si nécessaire
    if (!fs.existsSync(graphDir)) {
        fs.mkdirSync(graphDir, { recursive: true });
    }

    fs.writeFileSync(htmlFilePath, htmlContent);

    // Convertir en PNG avec Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const filePath = 'file://' + htmlFilePath;

    // Augmenter la résolution
    await page.setViewport({
        width: 1600,
        height: 600,
        deviceScaleFactor: 3
    });

    await page.goto(filePath, { waitUntil: 'networkidle0' });

    await page.screenshot({
        path: outputFile,
        fullPage: true
    });

    await browser.close();
    console.log(`Représentation graphique disponible dans le dossier graph, au nom de "spot_funding"`);

    // Supprimer le fichier HTML
    try { fs.unlinkSync(htmlFilePath) } catch (e) {}
}

function plotMMQuotes() {

}

module.exports = { plotSpotFunding, plotMMQuotes };