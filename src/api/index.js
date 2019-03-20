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

async function fetch20Vedios() {
  const url = 'https://www.xuexi.cn/4426aa87b0b64ac671c96379a3a8bd26/datadb086044562a57b441c24f2af1c8e101.js';
  const { data } = await axios.get(url); // fp2t40yxso9xk0028 
  const pos1 = data.indexOf('fp2t40yxso9xk0010');
  const pos2 = data.indexOf('fp2t40yxso9xk0013');
  const objstr = data.substr(pos1 + 19, pos2 - pos1 - 21)
  try {
    const list = JSON.parse(objstr); // 还有list2, 3, 4
    return [...list.list1, ...list.list2];
  } catch(error) {
    console.log(objstr.substr(0, 20));
    console.log(objstr.substr(objstr.length - 20, 20));
  }
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
