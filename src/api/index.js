const axios = require('axios');
const Cookie = require('../store/cookie');

axios.interceptors.request.use(
  config => {
    const cookie = Cookie.getCookie(); //获取Cookie
    config.headers['Cookie'] = cookie;
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);

async function fetch20News() {
  const url = 'https://www.xuexi.cn/lgdata/1crqb964p71.json';
  const { data } = await axios.get(url);
  return data;
}

async function fetch20Vedios() {
  const url = 'https://www.xuexi.cn/lgdata/1novbsbi47k.json';
  const { data } = await axios.get(url);
  return data;
}

async function getState() {
  const { data } = await axios.get(
    'https://pc-api.xuexi.cn/open/api/score/today/queryrate'
  );
  return data;
}

exports.getState = getState;
exports.fetch20News = fetch20News;
exports.fetch20Vedios = fetch20Vedios;
