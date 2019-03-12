const puppeteer = require('puppeteer');
const notifier = require('node-notifier');

const { getCookie, setCookie } = require('./utils/cookie');
const { getState } = require('./core/api');

const usedRules = [1, 2, 9, 1002, 1003];
class App {
  async init() {
    const [width, height] = [800, 600];
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--mute-audio', `--window-size=${width},${height}`]
    });
    this.page = await this.browser.newPage();

    await this.addCookies(getCookie());
    await this.page.setViewport({ width, height });
    await this.page.setRequestInterception(true);
    this.page.on('request', request => {
      if (request.resourceType() === 'image') request.abort();
      else request.continue();
    });
  }

  async start() {
    await this.init();
    await this.openLogin();
    await this.getWork();
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
        console.log('save login state succeed');
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
      return { name, value, domain: '.xuexi.cn' };
    });
    await this.page.setCookie(...cookies);
  }

  async getWork() {
    const result = await getState();
    const used = result.data.filter(item => usedRules.includes(item.ruleId));
    console.log(used);
  }

  async readArticle() {}

  log(str) {
    notifier.notify({
      title: 'LEARN',
      message: str
    });
  }
}

module.exports = App;
