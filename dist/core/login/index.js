"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const logger_1 = require("@flasco/logger");
const base_1 = tslib_1.__importDefault(require("../base"));
class Login extends base_1.default {
    async startLogin(isExpired) {
        await this.page.goto('https://pc.xuexi.cn/points/my-points.html');
        if (isExpired == null) {
            isExpired = await this.page.evaluate(() => {
                const href = window.location.href;
                if (href.includes('points/login'))
                    return true;
                const tipBox = document.querySelectorAll('.ant-modal-confirm-title');
                if (tipBox.length > 0) {
                    const tips = tipBox[0].textContent || '';
                    if (tips.includes('重新登录'))
                        return true;
                }
                return false;
            });
        }
        if (isExpired) {
            await this.page.evaluate(() => {
                document.cookie = '';
                const href = window.location.href;
                if (!href.includes('points/login')) {
                    window.location.href =
                        'https://pc.xuexi.cn/points/login.html?ref=https://pc.xuexi.cn/points/my-points.html';
                }
            });
            await this.page.waitForSelector('#ddlogin-iframe');
            await this.page.evaluate(() => {
                function striaightScroll(element) {
                    let rect = element.getBoundingClientRect();
                    let top = window.pageYOffset + rect.top;
                    window.scrollTo(0, top);
                }
                const el = document.querySelectorAll('#ddlogin-iframe')[0];
                if (el != null)
                    striaightScroll(el);
            });
            this.log('请扫描登录二维码');
            await this.page.waitForNavigation({ timeout: 0 });
        }
        const curUrl = await this.page.evaluate(() => location.href);
        if (curUrl.includes('xuexi.cn')) {
            logger_1.time.success('success login.');
            if (isExpired) {
                await this.saveCookies();
                logger_1.time.success('save login state succeed');
            }
        }
    }
}
exports.default = Login;
//# sourceMappingURL=index.js.map