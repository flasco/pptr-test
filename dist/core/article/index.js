"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const logger_1 = require("@flasco/logger");
const base_1 = tslib_1.__importDefault(require("../base"));
const article_1 = tslib_1.__importDefault(require("../../store/article"));
const api_1 = require("../../api");
class Article extends base_1.default {
    constructor() {
        super(...arguments);
        this.sum = 0;
        this.time = 0;
        this.readArr = [];
    }
    async start({ sum, time }, isHotTime) {
        if (isHotTime) {
            this.sum = ((sum + 1) / 2) >>> 0;
            this.time = (((time + 1) / 2) >>> 0) * 2;
        }
        else {
            this.time = time * 2;
            this.sum = sum;
        }
        if (this.sum < 1 && this.time < 1)
            return;
        if (this.time < 1)
            this.time = 1;
        if (this.sum < 1)
            this.sum = 1;
        logger_1.time.info(`需要查看 ${this.sum} 篇文章，花费 ${this.time} 分钟.`);
        await this.getArticleByNews();
        if (this.readArr.length >= this.sum) {
            logger_1.time.info('已获取足够的文章，开始阅读...');
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
            let time = ((1000 * 61 * this.time) / j) >>> 0;
            if (time < 60000)
                time = 60000;
            logger_1.time.info(`读完第 ${i + 1} 篇, wait ${(time / 1000) >>> 0} sec.`);
            await this.page.waitFor(time);
        }
        article_1.default.save();
    }
    async getArticleByNews() {
        const latestNews = await api_1.fetch20News();
        const list = latestNews.map((item) => {
            return {
                id: item.itemId,
                url: item.url,
            };
        });
        for (let i = 0, j = list.length; i < j && this.readArr.length < this.sum; i++) {
            const { id, url } = list[i];
            if (!article_1.default.hasArticleId(id)) {
                article_1.default.pushArticleId(id);
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
exports.default = Article;
//# sourceMappingURL=index.js.map