const colors = require("colors")
const { spotFundingCorrelation } = require('./script/core.js');

// Récupérer les arguments de la ligne de commande
const args = process.argv.slice(2);
const command = args[0]

// Vérifier l'argument et exécuter la fonction correspondante
if (command === 'spot-funding-correl') {
    const response = spotFundingCorrelation();
    console.log(colors.blue("Correlation entre les prix spot et les fundings rates de contrats perpetuels (BTC et ETH)"))
    console.table(response)
} else {

    console.log('La commande n\'est pas reconnue!');
}


