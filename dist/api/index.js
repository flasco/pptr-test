"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const cookie_1 = tslib_1.__importDefault(require("../store/cookie"));
axios_1.default.interceptors.request.use(config => {
    const cookie = cookie_1.default.getCookie();
    config.headers['Cookie'] = cookie;
    return config;
}, err => {
    return Promise.reject(err);
});
async function fetch20News() {
    const url = 'https://www.xuexi.cn/lgdata/1crqb964p71.json';
    const { data } = await axios_1.default.get(url);
    return data;
}
exports.fetch20News = fetch20News;
async function fetch20Vedios() {
    const url = 'https://www.xuexi.cn/lgdata/1novbsbi47k.json';
    const { data } = await axios_1.default.get(url);
    return data;
}
exports.fetch20Vedios = fetch20Vedios;
async function getState() {
    const { data: { data }, } = await axios_1.default.get('https://pc-api.xuexi.cn/open/api/score/today/queryrate');
    return data;
}
exports.getState = getState;
async function getptp() {
    const { data: { data }, } = await axios_1.default.get('https://pc-proxy-api.xuexi.cn/api/point/today/queryrate');
    return data;
}
exports.getptp = getptp;
//# sourceMappingURL=index.js.map