const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');

const { getPageImgRegex } = require('./regex');
const { zipFolder, makedir, getPageHTML } = require('../../utils');

exports.mangalivre = async (props) => {
  console.log('MangaLivre module');
  console.log(props);

  makedir('generated/mangalivre');

  const { url, name } = props;

  if (!url || !name) {
    console.log('Erro: Informe a url do capítulo e o nome');
    return;
  }

  const browser = await puppeteer.launch({ headless: 'new' });

  const chapters = await downloadManga(url, browser, name);

  await browser.close();
  await generatedCBR(name, chapters);

  console.log(`Completo - arquivo disponível em: generated/mangalivre/cbr/${name}`);
};

const getChapterList = async (mangaUrl, browser) => {
  const mangaPage = await browser.newPage();
  await mangaPage.goto(mangaUrl);

  // Navega ao fim da página e espera carregar mais itens da lista
  let originalOffset = 0;
  let endPage = false;
  while (!endPage) {
    await mangaPage.evaluate('window.scrollBy(0, document.body.scrollHeight)');
    await mangaPage.waitForTimeout(1500);

    let newOffset = await mangaPage.evaluate('window.pageYOffset');

    if (originalOffset === newOffset) {
      endPage = true;
    }
    originalOffset = newOffset;
  }

  const pageHtml = await mangaPage.content();
  const regex = /"(\/ler\/[a-z-/0-9]+)"/g;

  const matchs = Array.from(pageHtml.matchAll(regex));

  const chapterUrlList = matchs.map((chapterUrl) => {
    return 'https://mangalivre.net' + chapterUrl[1] + '#';
  });

  chapterUrlList.reverse();

  return chapterUrlList;
};

const downloadManga = async (mangaUrl, browser, name) => {
  const chapterUrlList = await getChapterList(mangaUrl, browser);

  makedir(`generated/mangalivre/${name}`);

  for (let chapterIndex = 0; chapterIndex < chapterUrlList.length; chapterIndex++) {
    const chapterUrl = chapterUrlList[chapterIndex];
    await downloadChapter(chapterUrl, browser, name, chapterIndex);
  }

  return chapterUrlList.length;
};

const downloadChapter = async (url, browser, name, chapterIndex) => {
  // IMAGEM
  const chapterPage = await browser.newPage();

  await chapterPage.goto(url);

  const lastPageNumber = await getLastPageNumber(chapterPage);

  for(let pageIndex = 0; pageIndex < lastPageNumber; pageIndex++) {
    const pageUrl = url.replace(/\/!page\d/, '') + `/!page${pageIndex}`;
    console.log('Baixando imagem da página:', pageUrl);

    const page = await browser.newPage();
    await page.goto(pageUrl);

    await downloadChapterImg(page, pageIndex, name, chapterIndex);
    await page.close();
  }
};

const downloadChapterImg = async (page, pageIndex, name, chapterIndex) => {
  const pageHtml = await getPageHTML(page);

  fs.writeFileSync('temp-file.html', pageHtml);

  // OBTER IMAGENS
  console.log('Avaliando:');
  const match = pageHtml.match(getPageImgRegex);

  if (!match) {
    console.log('Erro: Não foi possível encontrar a imagem do capítulo');
    return;
  }

  let pageImgUrl = match[1];

  console.log(pageImgUrl);

  await downloadChapterImgMin(pageImgUrl, pageIndex, name, chapterIndex);
};

const downloadChapterImgMin = async (pageImgUrl, pageImgIndex, name, chapterIndex) => {
  const pageImg = await axios({ method: 'get', url: pageImgUrl, responseType: 'stream' });

  makedir(`generated/mangalivre/${name}/img-${chapterIndex}`);

  return pageImg.data.pipe(fs.createWriteStream(`generated/mangalivre/${name}/img-${chapterIndex}/${name}-${('000' + pageImgIndex).slice(-3)}.jpeg`));
};

const getLastPageNumber = async (page) => {
  const pageHtml = await page.content();
  const regex = /<em reader-total-pages="">([0-9]+)<\/em>/;

  return parseInt(pageHtml.match(regex)[1]);
};

const generatedCBR = async (name, chapters) => {
  for (let chapterIndex = 0; chapterIndex < chapters; chapterIndex++) {
    makedir(`generated/mangalivre/${name}/cbr-${chapterIndex}`);

    await zipFolder(`generated/mangalivre/${name}/img-${chapterIndex}`, `generated/mangalivre/${name}/cbr-${chapterIndex}/${name}.cbr`);
  }
};
