"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const logger_1 = require("@flasco/logger");
const base_1 = tslib_1.__importDefault(require("../base"));
class Cookie extends base_1.default {
    constructor() {
        super('cookie', { str: '', time: 0 });
    }
    getCookie() {
        const store = this.getStore();
        const time = (store.time || 0);
        if (Date.now() - time > 3600000 * 5) {
            logger_1.time.info('cookie 存储时长超过五小时，请重新登录');
            return '';
        }
        return store.str;
    }
    setCookie(str) {
        this.store.str = str;
        this.store.time = Date.now();
        this.setStore(this.store);
        this.save();
    }
}
const newX = new Cookie();
exports.default = newX;
//# sourceMappingURL=index.js.map