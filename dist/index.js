"use strict";
const tslib_1 = require("tslib");
const puppeteer_core_1 = tslib_1.__importDefault(require("puppeteer-core"));
const logger_1 = require("@flasco/logger");
const login_1 = tslib_1.__importDefault(require("./core/login"));
const work_1 = tslib_1.__importDefault(require("./core/work"));
const article_1 = tslib_1.__importDefault(require("./core/article"));
const videx_1 = tslib_1.__importDefault(require("./core/videx"));
const cookie_1 = tslib_1.__importDefault(require("./store/cookie"));
const find_chrome_1 = tslib_1.__importDefault(require("./utils/find-chrome"));
class App {
    async init() {
        const [width, height] = [800, 600];
        const { executablePath } = await find_chrome_1.default();
        const browser = await puppeteer_core_1.default.launch({
            headless: false,
            args: [
                '--mute-audio',
                `--window-size=${width},${height}`,
                '--fast-start',
                '--disable-extensions',
                '--no-sandbox',
                '--autoplay-policy',
                '--no-user-gesture-required',
            ],
            executablePath,
        });
        const page = await browser.newPage();
        await this.addCookies(cookie_1.default.getCookie(), page);
        await page.setViewport({ width, height });
        await page.setRequestInterception(true);
        page.on('request', request => {
            const url = request.url();
            if ((url.endsWith('.jpg') || url.endsWith('.png')) &&
                !url.includes('prismplayer'))
                request.abort();
            else
                request.continue();
        });
        this.work = new work_1.default();
        this.login = new login_1.default(browser, page);
        this.article = new article_1.default(browser, page);
        this.videx = new videx_1.default(browser, page);
    }
    async addCookies(cookies_str, page) {
        if (cookies_str === '')
            return;
        const cookies = cookies_str.split(';').map(pair => {
            const name = pair.trim().slice(0, pair.trim().indexOf('='));
            const value = pair.trim().slice(pair.trim().indexOf('=') + 1);
            return { name, value, domain: '.xuexi.cn' };
        });
        await page.setCookie(...cookies);
    }
    async workQueue() {
        for (let triedCnt = 0;; triedCnt++) {
            if (triedCnt > 3) {
                this.article.log('error, tried cnt too much');
                break;
            }
            const result = await this.work.getWork();
            if (result == null)
                return false;
            const { article, video } = result;
            if (article.sum + article.time + video.sum + video.time < 1) {
                logger_1.time.success('finish!');
                break;
            }
            if (article.sum > 0 || article.time > 0) {
                await this.article.start(article);
            }
            if (video.sum > 0 || video.time > 0)
                await this.videx.start(video);
        }
        return true;
    }
    async start() {
        await this.init();
        let isExpired = null;
        while (1) {
            await this.login.startLogin(isExpired);
            if (await this.workQueue())
                break;
            if (isExpired === true)
                break;
            isExpired = true;
            this.article.log('is expired!, tried again...');
        }
        process.exit(0);
    }
}
module.exports = App;
//# sourceMappingURL=index.js.map