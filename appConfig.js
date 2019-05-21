// Create API credentials at https://www.bungie.net/en/Application, copy
// this file to `appConfig.js` and replace both the values details below.

module.exports = {
  dev: {
    apiKey: '55e808c8570e4f1fab362944e0157f4a',
    authUrl: 'https://www.bungie.net/en/Application/Authorize/11191'
  },

  beta: {
    apiKey: 'b20d704ac0c0414294adae7cd8073572',
    authUrl:
      'https://www.bungie.net/en/OAuth/Authorize?client_id=22786&response_type=code'
  },

  prod: {
    apiKey: '5f552b739cfd4e0e861ef35b7135530a',
    authUrl: 'https://www.bungie.net/en/Application/Authorize/11192'
  }
};
