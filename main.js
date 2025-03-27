const colors = require("colors")
const { spotFundingCorrelation, simulateMMImpact } = require('./script/core.js');

// Récupérer les arguments de la ligne de commande
const args = process.argv.slice(2);
const command = args[0]

// Vérifier l'argument et exécuter la fonction correspondante
if (command === 'spot-funding') {
    const response = spotFundingCorrelation();
    console.log(colors.blue("Correlation entre les prix spots et les funding rates de contrats perpetuels (BTC et ETH)"))
    console.table(response)
} if (command === 'MM-quote') {
    const response = simulateMMImpact('BTC', 3);
   // console.log(colors.blue("Correlation entre les prix spots et les funding rates de contrats perpetuels (BTC et ETH)"))
} else {

    console.log('La commande n\'est pas reconnue!');
}


