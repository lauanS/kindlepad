const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');

const { getPageImgRegex } = require('./regex');
const { zipFolder } = require('../../utils/zip');

exports.mangalivre = async (props) => {
  console.log('MangaLivre module');

  const { url, name } = props;

  if (!url || !name) {
    console.log('Erro: Informe a url do capítulo e o nome');
    return;
  }

  const browser = await puppeteer.launch({ headless: true });

  await downloadChapter(url, browser, name);
  await browser.close();

  await generatedCBR(name);

  console.log(`Completo - arquivo disponível em: generated/mangalivre/cbr/${name}`);
};

const downloadChapter = async (url, browser, name) => {
  // IMAGEM
  const chapterPage = await browser.newPage();

  await chapterPage.goto(url);

  const lastPageNumber = await getLastPageNumber(chapterPage);

  for(let pageIndex = 0; pageIndex < lastPageNumber; pageIndex++) {
    const pageUrl = url.replace(/\/!page\d/, '') + `/!page${pageIndex}`;
    console.log('Baixando imagem da página:', pageUrl);

    const page = await browser.newPage();
    await page.goto(pageUrl);

    await downloadChapterImg(page, pageIndex, name);
    await page.close();
  }
};

const downloadChapterImg = async (page, pageIndex, name) => {
  let pageHtml = await page.content();
  pageHtml = pageHtml.replace(/(?:\r\n|\r|\n)/g, ' ');
  pageHtml = pageHtml.replace(/( ){2,}/g, ' ');

  fs.writeFileSync('temp-file.html', pageHtml);

  // OBTER IMAGENS
  console.log('Avaliando:');
  let pageImgUrl = pageHtml.match(getPageImgRegex)[1];

  console.log(pageImgUrl);

  await downloadChapterImgMin(pageImgUrl, pageIndex, name);
};

const downloadChapterImgMin = async (pageImgUrl, pageImgIndex, name) => {
  const pageImg = await axios({ method: 'get', url: pageImgUrl, responseType: 'stream' });

  return pageImg.data.pipe(fs.createWriteStream(`generated/mangalivre/img/${name}-${('000' + pageImgIndex).slice(-3)}.jpeg`));
};

const getLastPageNumber = async (page) => {
  const pageHtml = await page.content();
  const regex = /<em reader-total-pages="">([0-9]+)<\/em>/;

  return parseInt(pageHtml.match(regex)[1]);
};

const generatedCBR = async (name) => {
  await zipFolder('generated/mangalivre/img', `generated/mangalivre/cbr/${name}.cbr`);
};
