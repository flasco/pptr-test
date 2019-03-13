const Base = require('../base');

const articleStore = require('../../store/article');

const { fetch20News } = require('../../api');
class Article extends Base {
  constructor(...props) {
    super(...props);
    this.readArr = [];
  }
  async start({ sum, time }, isHotTime) {
    if (isHotTime) {
      this.sum = ((sum + 1) / 2) >>> 0; // 阅读数
      this.time = (((time + 1) / 2) >>> 0) * 4; // 所需要的分钟数
    } else {
      this.time = time * 4;
      this.sum = sum;
    }

    if (this.sum < 1 && this.time < 1) return;
    console.log(`需要查看 ${this.sum} 篇文章，花费 ${this.time} 分钟.`);

    await this.getArticleByNews();
    if (this.readArr.length >= this.sum) {
      console.log('已获取足够的文章，开始阅读...');
      await this.readArticle();
    }
  }

  async readArticle() {
    for (let i = 0, j = this.readArr.length; i < j; i++) {
      const current = this.readArr[i];
      await this.page.goto(current);
      await this.autoScroll(this.page);
      await this.page.waitFor(700);
      await this.autoScroll(this.page, true);
      const time = ((1000 * 61 * this.time) / j) >>> 0;
      console.log(`读完第 ${i + 1} 篇, wait ${time} sec.`);
      await this.page.waitFor(time);
    }
  }

  async getArticleByNews() {
    const latestNews = await fetch20News();
    const list = latestNews.map(item => {
      return {
        id: item._id,
        url: item.static_page_url
      };
    });
    list.reverse();
    for (let i = 0, j = list.length; i < j && this.readArr.length < sum; i++) {
      const { id, url } = list[i];
      if (!articleStore.hasArticleId(id)) {
        articleStore.pushArticleId(id);
        this.readArr.push(url);
      }
    }
  }

  async autoScroll(page, isUp = false) {
    return await page.evaluate(isUp => {
      return new Promise(resolve => {
        let scrollHeight = document.body.scrollHeight;
        let totalHeight = 0;
        const distance = 100;
        const timer = isUp
          ? setInterval(() => {
              window.scrollBy(0, -distance);
              scrollHeight -= distance;
              if (scrollHeight <= 0) {
                clearInterval(timer);
                resolve();
              }
            }, 650)
          : setInterval(() => {
              window.scrollBy(0, distance);
              totalHeight += distance;
              if (totalHeight >= scrollHeight) {
                clearInterval(timer);
                resolve();
              }
            }, 650);
      });
    }, isUp);
  }
}

module.exports = Article;
