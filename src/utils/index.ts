import fs from 'fs';
import { platform } from 'os';
const isWin = platform().startsWith('win');

export function isExist(filePath: string) {
  return fs.existsSync(filePath);
}

export function checkDirExist(folderpath: string) {
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

export function writeFileSync(filePath: string, content: any) {
  return fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
}

export const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

  /** 期望值 = [0.75 * ms ~ 1.25 * ms] */
export const getRandomWaitTime = (ms: number) => {
  return (ms * Math.random()) / 2 + (ms / 4 * 3);
};
