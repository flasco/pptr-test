const path = require('path');
const getAppDataPath = require('appdata-path');

const { isExist, writeFileSync, checkDirExist } = require('../../utils');

const dataPath = getAppDataPath('pptr-test');

checkDirExist(dataPath);

class Store {
  constructor(name, initialValue = {}) {
    this.storePath = path.resolve(dataPath, `./${name}.json`);

    const existFlag = isExist(this.storePath);
    this.store = existFlag ? require(this.storePath) : initialValue;
  }

  getStore() {
    return this.store;
  }

  setStore(store) {
    this.store = store;
    writeFileSync(this.storePath, store);
  }
}

module.exports = Store;
