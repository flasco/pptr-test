const path = require('path');
const getAppDataPath = require('appdata-path');

const { isExist, writeFileSync, checkDirExist } = require('../../utils');

const dataPath = getAppDataPath('pptr-test');

checkDirExist(dataPath);

class Store {
  constructor(name, initialValue = {}) {
    this.name = name;
    this.storePath = path.resolve(dataPath, `./${name}.json`);

    const existFlag = isExist(this.storePath);
    this.store = existFlag ? require(this.storePath) : initialValue;
  }

  getStore() {
    return this.store;
  }

  setStore(store) {
    const keys = Object.keys(store);
    if (keys.length > 1000) {
      console.log(`检测到 ${this.name} 存储过千，开始清理...`);
      let cleaned = 0;
      const needClean = keys.length - 200;
      keys.every((key) => {
        if (cleaned >= needClean) return false;
        if (store[key] < new Date().getTime() - 1000 * 60 * 60 * 24 * 7) {
          cleaned++;
          delete store[key];
          return true;
        } else {
          return false;
        }
      });
      console.log('清理完毕，当前剩余', Object.keys(store).length, '条');
    }
    this.store = store;
  }

  save() {
    writeFileSync(this.storePath, this.store);
  }
}

module.exports = Store;
