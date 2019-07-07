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

export async function getptp() {
  const {
    data: { data },
  } = await axios.get(
    'https://pc-proxy-api.xuexi.cn/api/point/today/queryrate'
  );
  return data;
}
