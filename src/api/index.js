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

const articleMap = {
  news: {
    url: 'https://www.xuexi.cn/bab787a637b47d3e51166f6a0daeafdb/data9a3668c13f6e303932b5e0e100fc248b.js',
    key: 'fpcka8ayva4e0001',
  }
}

async function fetch20News() {
  const news = articleMap.news;
  const { data } = await axios.get(news.url);
  const obj = data.substr(14).substr(0, data.length - 15);
  const list = JSON.parse(obj)[news.key].list;
  return list.slice(0, 20);
}

async function getState() {
  const { data } = await axios.get(
    'https://pc-api.xuexi.cn/open/api/score/today/queryrate'
  );
  return data;
}

exports.getState = getState;
exports.fetch20News = fetch20News;
