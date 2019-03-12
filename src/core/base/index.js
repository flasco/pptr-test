const notifier = require('node-notifier');

const { setCookie } = require('../../utils/cookie');

class Base {
  constructor(browser, page) {
    this.browser = browser;
    this.page = page;
  }

  async saveCookies() {
    const cookies = await this.page.evaluate(() => document.cookie);
    setCookie(cookies);
  }

  log(str) {
    notifier.notify({
      title: 'LEARN',
      message: str
    });
  }
}

module.exports = Base;
