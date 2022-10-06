const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { getPageImgRegex } = require('./regex');

exports.mangalivre = async (props) => {
  console.log('MangaLivre module');

  const { url } = props;

  const browser = await puppeteer.launch({ headless: true });

  await downloadChapter(url, browser);

  await browser.close();
};

const downloadChapter = async (url, browser) => {
  // IMAGEM
  const chapterPage = await browser.newPage();

  await chapterPage.goto(url);

  const lastPageNumber = await getLastPageNumber(chapterPage);

  for(let pageIndex = 0; pageIndex < lastPageNumber; pageIndex++) {
    const pageUrl = url + `/!page${pageIndex}`;
    console.log('Baixando imagem da página:', pageUrl);

    const page = await browser.newPage();
    await page.goto(pageUrl);

    await downloadChapterImg(page, pageIndex);
    await page.close();
  }
};

const downloadChapterImg = async (page, pageIndex) => {
  let pageHtml = await page.content();
  pageHtml = pageHtml.replace(/(?:\r\n|\r|\n)/g, ' ');
  pageHtml = pageHtml.replace(/( ){2,}/g, ' ');

  fs.writeFileSync('temp-file.html', pageHtml);

  // OBTER IMAGENS
  console.log('Avaliando:');
  let pageImgUrl = pageHtml.match(getPageImgRegex)[1];

  console.log(pageImgUrl);

  await downloadChapterImgMin(pageImgUrl, pageIndex);
};

const downloadChapterImgMin = async (pageImgUrl, pageImgIndex) => {
  const pageImg = await axios({ method: 'get', url: pageImgUrl, responseType: 'stream' });

  return pageImg.data.pipe(fs.createWriteStream(`generated/mangalivre/img${('000' + pageImgIndex).slice(-3)}.jpeg`));
};

const getLastPageNumber = async (page) => {
  const pageHtml = await page.content();
  const regex = /<em reader-total-pages="">(74)<\/em>/;

  return parseInt(pageHtml.match(regex)[1]);
};
