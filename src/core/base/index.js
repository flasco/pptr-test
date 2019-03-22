const notifier = require('node-notifier');

const Cookie = require('../../store/cookie');

class Base {
  constructor(browser, page) {
    this.browser = browser;
    this.page = page;
  }

  async saveCookies() {
    const cookies = await this.page.evaluate(() => document.cookie);
    Cookie.setCookie(cookies);
  }

  log(str) {
    console.log(str);
    notifier.notify({
      title: 'LEARN',
      message: str
    });
  }
}

module.exports = Base;
