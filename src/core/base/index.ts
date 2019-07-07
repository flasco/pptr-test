import notifier from 'node-notifier';
import { Browser, Page } from 'puppeteer-core';
import { time as Logger } from '@flasco/logger';

import Cookie from '../../store/cookie';

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

  log(str: string) {
    Logger.info(str);

    notifier.notify({
      title: 'LEARN',
      message: str,
    });
  }
}

export default Base;
