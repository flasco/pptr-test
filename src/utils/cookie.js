const path = require('path');
const getAppDataPath = require('appdata-path');

const { isExist, writeFileSync, checkDirExist } = require('./index');


const dataPath = getAppDataPath('pptr-test');

checkDirExist(dataPath);

const cookiePath = path.resolve(dataPath, './cookies.json');
const existFlag = isExist(cookiePath);

const cookie = existFlag ? require(cookiePath) : { str: '' };

function getCookie() {
  return cookie.str;
}

function setCookie(str) {
  cookie.str = str;
  writeFileSync(cookiePath, cookie);
}

exports.getCookie = getCookie;
exports.setCookie = setCookie;
