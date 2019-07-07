"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_1 = tslib_1.__importDefault(require("../base"));
class Cookie extends base_1.default {
    constructor() {
        super('cookie', { str: '' });
    }
    getCookie() {
        return this.getStore().str;
    }
    setCookie(str) {
        this.store.str = str;
        this.setStore(this.store);
        this.save();
    }
}
const newX = new Cookie();
exports.default = newX;
//# sourceMappingURL=index.js.map