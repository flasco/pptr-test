import axios from 'axios';
import Cookie from '../store/cookie';

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

export async function fetch20News() {
  const url = 'https://www.xuexi.cn/lgdata/1crqb964p71.json';
  const { data } = await axios.get(url);
  return data;
}

export async function fetch20Vedios() {
  const url = 'https://www.xuexi.cn/lgdata/1novbsbi47k.json';
  const { data } = await axios.get(url);
  return data;
}

export async function getState() {
  const {
    data: { data },
  } = await axios.get('https://pc-api.xuexi.cn/open/api/score/today/queryrate');
  return data;
}

export async function getWeekQuestion() {
  const url = 'https://pc-proxy-api.xuexi.cn/api/exam/service/practice/pc/weekly/more?pageNo=1&pageSize=900';
  const { data } = await axios.get(url);
  const { data_str } = data;
  const curData = Buffer.from(data_str, 'base64').toString('utf-8');
  return JSON.parse(curData);
}

// export async function getptp() {
//   const {
//     data: { data },
//   } = await axios.get(
//     'https://pc-proxy-api.xuexi.cn/api/point/today/queryrate'
//   );
//   return data;
// }
