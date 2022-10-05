const { mangalivre } = require('./modules/mangalivre');

exports.kindlepad = (website, cookie, moduleList) => {
  const hostname = (new URL(website)).hostname;

  mangalivre();
};
