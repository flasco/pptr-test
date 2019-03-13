const puppeteer = require('puppeteer-core');

const Login = require('./core/login');
const Work = require('./core/work');
const Article = require('./core/article');
const Videx = require('./core/videx');

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
        '--no-sandbox',
        // 下面 2 个是为了允许自动播放
        '--autoplay-policy',
        '--no-user-gesture-required',
        '--disable-web-security' // 允许视频下载
      ],
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });
    const page = await browser.newPage();
    await page.setBypassCSP(true);

    await this.addCookies(Cookie.getCookie(), page);
    await page.setViewport({ width, height });

    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = request.url();
      if (
        (url.endsWith('.jpg') || url.endsWith('.png')) &&
        !url.includes('prismplayer')
      )
        request.abort();
      else request.continue();
    });

    this.login = new Login(browser, page);
    this.work = new Work(browser, page);
    this.article = new Article(browser, page);
    this.videx = new Videx(browser, page);
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
    !isHotTime && console.log('现在不是双倍时间，建议双倍时间再看');
    await this.article.start(article, isHotTime);
    await this.videx.start(video, isHotTime);
  }
}

module.exports = App;
