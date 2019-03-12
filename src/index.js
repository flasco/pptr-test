const puppeteer = require('puppeteer');

const Login = require('./core/login');
const Work = require('./core/work');
const Article = require('./core/article');

const Cookie = require('./store/cookie');

class App {
  async init() {
    const [width, height] = [800, 600];
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        '--mute-audio',
        `--window-size=${width},${height}`,
        '--fast-start',
        '--disable-extensions',
        '--no-sandbox'
      ]
    });
    const page = await browser.newPage();

    await this.addCookies(Cookie.getCookie(), page);
    await page.setViewport({ width, height });

    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = request.url();
      if (url.endsWith('.png') || url.endsWith('.jpg')) request.abort();
      else request.continue();
    });

    this.login = new Login(browser, page);
    this.work = new Work(browser, page);
    this.article = new Article(browser, page); 
  }

  async addCookies(cookies_str, page) {
    if (cookies_str == '') return;
    const cookies = cookies_str.split(';').map(pair => {
      const name = pair.trim().slice(0, pair.trim().indexOf('='));
      const value = pair.trim().slice(pair.trim().indexOf('=') + 1);
      return { name, value, domain: '.xuexi.cn' };
    });
    await page.setCookie(...cookies);
  }

  async start() {
    await this.init();
    await this.login.startLogin();
    const { article, video } = await this.work.getWork();
    const isHotTime = this.work.isHOTTIME();
    await this.article.start(article, isHotTime);
    
  }
}

module.exports = App;
