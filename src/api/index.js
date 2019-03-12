const axios = require('axios');
const { getCookie } = require('../utils/cookie');

axios.interceptors.request.use(
  config => {
    const cookie = getCookie(); //获取Cookie
    config.headers['Cookie'] = cookie;
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);

async function getState() {
  const { data } = await axios.get(
    'https://pc-api.xuexi.cn/open/api/score/today/queryrate'
  );
  return data;
}

exports.getState = getState;
