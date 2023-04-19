import { Page } from 'puppeteer-core';


import Base, { IStartOpt } from '../base';
import articleStore from '@src/store/article';
import { fetch20News } from '@src/api';
import { delay, getRandomWaitTime } from '@src/utils';

class Article extends Base {
  sum = 0;
  time = 0;
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
    console.log(`需要查看 ${this.sum} 篇文章，花费 ${this.time} 分钟.`);

    await this.getArticleByNews();
    if (this.readArr.length >= this.sum) {
      console.log('已获取足够的文章，开始阅读...');
      await this.readArticle();
    }
  }

  async readArticle() {
    for (let i = 0; i < this.sum; i++) {
      const current = this.readArr[i];
      await this.page.goto(current);
      await delay(getRandomWaitTime(3200));
      await this.autoScroll(this.page);
      await delay(getRandomWaitTime(1700));
      await this.autoScroll(this.page, true);
      let time = Math.round((1000 * 61 * this.time) / this.sum) + getRandomWaitTime(10000);
      if (time < 75000) time = Math.round((75000 + getRandomWaitTime(30000)));
      console.log(`读完第 ${i + 1} 篇, wait ${Math.round(time / 1000)} sec.`);
      await delay(time);
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
        const distance = 10;

        const scrollTop = () => {
          window.scrollBy(0, -distance);
          scrollHeight -= distance;
          if (scrollHeight <= 0) {
            clearInterval(timer);
            resolve(1);
          }
        };
        const scrollBottom = () => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve(1);
          }
        };
        const timer = setInterval(isUp ? scrollTop : scrollBottom, 16);
      });
    }, isUp);
  }
}

export default Article;
