const fs = require('fs');
const { platform } = require('os');
const isWin = platform().startsWith("win");

function isExist(filePath) {
  return fs.existsSync(filePath);
}

function checkDirExist(folderpath) {
  if (isWin) {
    const pathArr = folderpath.split('\\');
    let _path = '';
    for (let i = 0; i < pathArr.length; i++) {
      if (pathArr[i]) {
        _path += (isWin && i === 0 ? '' : '\\') + pathArr[i];
        if (!fs.existsSync(_path)) {
          fs.mkdirSync(_path);
        }
      }
    }
  } else {
    const pathArr = folderpath.split('/');
    let _path = '';
    for (let i = 0; i < pathArr.length; i++) {
      if (pathArr[i]) {
        _path += `/${pathArr[i]}`;
        if (!fs.existsSync(_path)) {
          fs.mkdirSync(_path);
        }
      }
    }
  }
}

function writeFileSync(filePath, content) {
  return fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

exports.delay = delay;
exports.isExist = isExist;
exports.checkDirExist = checkDirExist;
exports.writeFileSync = writeFileSync;
