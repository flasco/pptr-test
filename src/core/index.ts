import puppeteer, { Page } from 'puppeteer-core';

import Login from './login';
import Article from './article';
import VideoWatch from './video-watch';
import Question from './question';

import Cookie from '@src/store/cookie';

import findChrome from '@src/utils/find-chrome';
import { getTaskProgress, getCurrentScore, getTodayEarnedScore } from '@src/api';

export = class App {
  login!: Login;
  article!: Article;
  videoWatcher!: VideoWatch;
  question!: Question;

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

    this.login = new Login(browser, page);
    this.article = new Article(browser, page);
    this.videoWatcher = new VideoWatch(browser, page);
    this.question = new Question(browser, page);
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
        this.article.logWithNotify('失败重试太多次啦，退出！');
        break;
      }
      const result = await getTaskProgress();
      if (result == null) return;
      const { article, video, question } = result;
      /** 因为 read article 有 bug，有时候看了也算不进去，就不看重复了，否则可能被风控 */
      if (article.sum <= 1 && video.sum === 0 && question.sum === 0) {
        this.article.logWithNotify('today task all finished~ ヾ(*′○`)ﾟ.+:｡ﾟ☆');
        const currentScore = await getCurrentScore();
        const earnedScore = await getTodayEarnedScore();

        console.log(`current score: ${currentScore}, today earned score：${earnedScore}`)
        break;
      }

      if (article.sum > 0 || article.time > 0) {
        await this.article.start(article);
      }
      if (video.sum > 0 || video.time > 0) {
        await this.videoWatcher.start(video);
      }
      if (question.sum > 0) {
        await this.question.start();
      }
    }
  }

  async start() {
    await this.init();
    await this.login.startLogin();
    await this.workQueue();

    process.exit(0);
  }
};
