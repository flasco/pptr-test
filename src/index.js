const puppeteer = require('puppeteer');
const notifier = require('node-notifier');

const { getCookie, setCookie } = require('./utils/cookie');

class App {
  constructor() {
    this.openLogin = this.openLogin.bind(this);
  }
  async init() {
    const [width, height] = [800, 600];
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--mute-audio', `--window-size=${width},${height}`]
    });
    this.page = await this.browser.newPage();

    await this.addCookies(getCookie());
    await this.page.setViewport({ width, height });
  }

  async start() {
    await this.init();
    await this.openLogin();
  }

  async openLogin() {
    await this.page.goto('https://pc.xuexi.cn/points/login.html');
    const res = await this.page.evaluate(() => location.href);
    const isExpired = res.includes('login');
    if (isExpired) {
      this.log('请扫描登录二维码');
      const loginUrl = await this.page.evaluate(() => {
        const src = document
          .querySelector('#ddlogin-iframe')
          .src.split('?goto=')[1];
        return decodeURIComponent(src);
      });

      await this.page.goto(loginUrl);
      await this.page.waitForNavigation(0);
    }

    const curUrl = await this.page.evaluate(() => location.href);
    if (curUrl.includes('my-study')) {
      console.log('success login.');
      if (isExpired) {
        await this.saveCookies();
        console.log('save succeed');
      }
    }
  }

  async saveCookies() {
    const cookies = await this.page.evaluate(() => document.cookie);
    setCookie(cookies);
  }

  async addCookies(cookies_str) {
    if (cookies_str == '') return;
    const cookies = cookies_str.split(';').map(pair => {
      const name = pair.trim().slice(0, pair.trim().indexOf('='));
      const value = pair.trim().slice(pair.trim().indexOf('=') + 1);
      return { name, value, domain: 'pc.xuexi.cn' };
    });
    await this.page.setCookie(...cookies);
  }

  log(str) {
    notifier.notify({
      title: 'LEARN',
      message: str
    });
  }
}

module.exports = App;
