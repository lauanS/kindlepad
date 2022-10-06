const archiver = require('archiver');
const fs = require('fs');

/**
 * @param {String} sourceDir: Pasta que será compactada
 * - /some/folder/to/compress
 * @param {String} outputPath: Destino do arquivo compactado
 * - /path/to/created.zip
 * @see https://stackoverflow.com/questions/15641243/need-to-zip-an-entire-directory-using-node-js
 * @returns {Promise<pending>}
 */
exports.zipFolder = (sourceDir, outputPath) => {
  const archive = archiver('zip', { zlib: { level: 9 }});
  const stream = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on('error', err => reject(err))
      .pipe(stream)
    ;

    stream.on('close', () => resolve());
    archive.finalize();
  });
};

/**
 * Cria o diretório caso não exista
 * @param {String} dir: Caminho do diretório
 */
exports.makedir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

/**
 * Obtem o HTML da página
 * @param {Puppeteer.Page} page: Página do puppeteer
 * @returns {String} HTML da página
 */
exports.getPageHTML = async (page) => {
  let pageHtml = await page.content();

  pageHtml = pageHtml.replace(/(?:\r\n|\r|\n)/g, ' ');
  pageHtml = pageHtml.replace(/( ){2,}/g, ' ');

  return pageHtml;
};

