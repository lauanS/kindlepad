const fs = require('fs');

// Entrada
const args = process.argv.slice(2);

if (!args || args.length !== 2) {
  console.log('Quantidade de parâmetros inferior ao esperado');
}

const website = args[0];
const cookie = args[1];

const hostname = (new URL(website)).hostname

// Lista de módulos
const rawdata = fs.readFileSync('./module-list.json');
const moduleList = JSON.parse(rawdata);

console.log(moduleList[hostname]);
