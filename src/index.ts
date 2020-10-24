import puppeteer, { Page } from 'puppeteer-core';
import { time as Logger } from '@flasco/logger'

import Login from './core/login';
import Work from './core/work';
import Article from './core/article';
import Videx from './core/videx';

import Cookie from './store/cookie';

import findChrome from './utils/find-chrome';


class App {
  login: any;
  work: any;
  article: any;
  videx: any;

  async init() {
    const [width, height] = [800, 600];

    const { executablePath } = await findChrome();
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--mute-audio',
        `--window-size=${width},${height}`,
        '--fast-start',
        '--disable-extensions',
        '--no-sandbox',
        // 下面 2 个是为了允许自动播放
        '--autoplay-policy',
        '--no-user-gesture-required',
      ],
      executablePath,
    });
    const page = await browser.newPage();

    await this.addCookies(<string>Cookie.getCookie(), page);
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

    this.work = new Work();
    this.login = new Login(browser, page);
    this.article = new Article(browser, page);
    this.videx = new Videx(browser, page);
  }

  async addCookies(cookies_str: string, page: Page) {
    if (cookies_str === '') return;
    const cookies = cookies_str.split(';').map(pair => {
      const name = pair.trim().slice(0, pair.trim().indexOf('='));
      const value = pair.trim().slice(pair.trim().indexOf('=') + 1);
      return { name, value, domain: '.xuexi.cn' };
    });
    await page.setCookie(...cookies);
  }

  async workQueue() {
    for (let triedCnt = 0; ; triedCnt++) {
      if (triedCnt > 3) {
        this.article.log('error, tried cnt too much');
        break;
      }
      const result = await this.work.getWork();
      if (result == null) return false;
      const { article, video } = result;
      if (article.sum + article.time + video.sum + video.time < 1) {
        Logger.success('finish!');
        break;
      }
      if (article.sum > 0 || article.time > 0) {
        await this.article.start(article);
      }
      if (video.sum > 0 || video.time > 0) await this.videx.start(video);
    }
    return true;
  }

  async start() {
    await this.init();
    let isExpired = null;
    while (1) {
      await this.login.startLogin(isExpired);
      if (await this.workQueue()) break;
      if (isExpired === true) break;
      isExpired = true;
      this.article.log('is expired!, tried again...');
    }

    process.exit(0);
  }
}

export = App;
