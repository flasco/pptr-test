import { Page } from 'puppeteer-core';
import { time as Logger } from '@flasco/logger';

import Base, { IStartOpt } from '../base';
import articleStore from '../../store/article';
import { fetch20News } from '../../api';

class Article extends Base {
  sum: number = 0;
  time: number = 0;
  readArr: string[] = [];

  async start({ sum, time }: IStartOpt, isHotTime?: boolean) {
    if (isHotTime) {
      this.sum = ((sum + 1) / 2) | 0; // 阅读数
      this.time = (((time + 1) / 2) | 0) * 2; // 所需要的分钟数
    } else {
      this.time = time;
      this.sum = sum;
    }

    if (this.sum < 1 && this.time < 1) return;
    if (this.time < 1) this.time = 1; // 添加最低阅读时间
    if (this.sum < 1) this.sum = 1; // 添加最低阅读内容
    Logger.info(`需要查看 ${this.sum} 篇文章，花费 ${this.time} 分钟.`);

    await this.getArticleByNews();
    if (this.readArr.length >= this.sum) {
      Logger.info('已获取足够的文章，开始阅读...');
      await this.readArticle();
    }
  }

  async readArticle() {
    for (let i = 0; i < this.sum; i++) {
      const current = this.readArr[i];
      await this.page.goto(current);
      await this.autoScroll(this.page);
      await this.page.waitFor(700);
      await this.autoScroll(this.page, true);
      let time = ((1000 * 61 * this.time) / j) | 0;
      if (time < 75000) time = (75000 + Math.random() * 30000) | 0;
      Logger.info(`读完第 ${i + 1} 篇, wait ${(time / 1000) | 0} sec.`);
      await this.page.waitFor(time);
    }
    articleStore.save();
  }

  async getArticleByNews() {
    const latestNews = await fetch20News();
    const list = latestNews.map((item: any) => {
      return {
        id: item.itemId,
        url: item.url,
      };
    });
    for (
      let i = 0, j = list.length;
      i < j && this.readArr.length < this.sum;
      i++
    ) {
      const { id, url } = list[i];
      if (!articleStore.hasArticleId(id)) {
        articleStore.pushArticleId(id);
        this.readArr.push(url);
      }
    }
  }

  async autoScroll(page: Page, isUp = false) {
    return await page.evaluate(isUp => {
      return new Promise(resolve => {
        let scrollHeight = document.body.scrollHeight;
        let totalHeight = 0;
        const distance = 100;

        const scrollTop = () => {
          window.scrollBy(0, -distance);
          scrollHeight -= distance;
          if (scrollHeight <= 0) {
            clearInterval(timer);
            resolve();
          }
        };
        const scrollBottom = () => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        };
        const timer = setInterval(isUp ? scrollTop : scrollBottom, 100);
      });
    }, isUp);
  }
}

export default Article;
