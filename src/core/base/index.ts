import notifier from 'node-notifier';
import { Browser, Page } from 'puppeteer-core';


import Cookie from '@src/store/cookie';

export interface IStartOpt {
  sum: number;
  time: number;
}

class Base {
  page: Page;
  browser: Browser;

  constructor(browser: Browser, page: Page) {
    this.browser = browser;
    this.page = page;
  }

  async saveCookies() {
    const cookies = await this.page.evaluate(() => document.cookie);
    Cookie.setCookie(cookies);
  }

  logWithNotify(str: string) {
    console.log(str);

    notifier.notify({
      title: 'LEARN',
      message: str,
    });
  }
}

export default Base;
