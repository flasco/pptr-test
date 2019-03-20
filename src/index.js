const puppeteer = require('puppeteer-core');

const Login = require('./core/login');
const Work = require('./core/work');
const Article = require('./core/article');
const Videx = require('./core/videx');

const findChrome = require('./utils/find-chrome');

const Cookie = require('./store/cookie');

class App {
  async init() {
    const [width, height] = [800, 600];

    const { executablePath } = await findChrome();
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
        '--no-user-gesture-required'
      ],
      executablePath
    });
    const page = await browser.newPage();

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
    let triedCnt = 0;
    while (1) {
      triedCnt++;
      if (triedCnt > 3) {
        this.article.log('error, tried cnt too much');
        break;
      }
      const { article, video } = await this.work.getWork();
      if (article.sum + article.time + video.sum + video.time < 1) break;
      const isHotTime = this.work.isHOTTIME();
      !isHotTime && console.log('现在不是双倍时间，建议双倍时间再打开');
      if (article.sum > 0 || article.time > 0)
        await this.article.start(article, isHotTime);
      if (video.sum > 0 || video.time > 0)
        await this.videx.start(video, isHotTime);
    }

    this.article.log('finish!');
    process.exit(0);
  }
}

module.exports = App;
