const axios = require('axios');
const fs = require('fs');
const { getPageImg } = require('./regex');
exports.mangalivre = async (props) => {
  console.log('MangaLivre module');

  const { url } = props;

  const response = await axios({ method: 'get', url });

  if (response.status !== 200) {
    console.log('Ocorreu um erro!');
    console.log(response);

    return;
  }

  console.log('status code:', response.status);

  let pageHtml = response.data.replace(/(?:\r\n|\r|\n)/g, ' ');
  pageHtml = pageHtml.replace(/( ){2,}/g, ' ');

  fs.writeFileSync('temp-file.html', pageHtml);

  const match = pageHtml.match(getPageImg);

  console.log(match[1]);

  const pageImgUrl = match[1];

  const pageImg = await axios({ method: 'get', url: pageImgUrl, responseType: 'stream' });

  pageImg.data.pipe(fs.createWriteStream('img.jpeg'));
};
