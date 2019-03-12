const Base = require('../base');

class Cookie extends Base {
  constructor() {
    super('cookie', { str: '' });
  }
  getCookie() {
    return this.getStore().str;
  }

  setCookie(str) {
    this.store.str = str;
    return this.setStore(this.store);
  }
}

const newX = new Cookie();

module.exports = newX;
