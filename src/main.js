const { mangalivre } = require('./modules/mangalivre');

exports.kindlepad = (website, params, moduleList) => {
  const hostname = (new URL(website)).hostname;

  if (moduleList[hostname]) {
    const props = {
      url: website,
      name: params[0]
    };

    mangalivre(props);
  }
};
