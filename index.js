const fs = require('fs');
const { kindlepad } = require('./src/main');

// Entrada
const args = process.argv.slice(2);

if (!args || args.length !== 2) {
  console.log('Quantidade de parâmetros inferior ao esperado');
}

const website = args[0];
const params = args.slice(1);

// Lista de módulos
const rawdata = fs.readFileSync('./module-list.json');
const moduleList = JSON.parse(rawdata);

kindlepad(website, params, moduleList);
