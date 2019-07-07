"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_notifier_1 = tslib_1.__importDefault(require("node-notifier"));
const logger_1 = require("@flasco/logger");
const cookie_1 = tslib_1.__importDefault(require("../../store/cookie"));
class Base {
    constructor(browser, page) {
        this.browser = browser;
        this.page = page;
    }
    async saveCookies() {
        const cookies = await this.page.evaluate(() => document.cookie);
        cookie_1.default.setCookie(cookies);
    }
    log(str) {
        logger_1.time.info(str);
        node_notifier_1.default.notify({
            title: 'LEARN',
            message: str,
        });
    }
}
exports.default = Base;
//# sourceMappingURL=index.js.map