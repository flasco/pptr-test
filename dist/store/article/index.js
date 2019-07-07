"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_1 = tslib_1.__importDefault(require("../base"));
class Article extends base_1.default {
    constructor() {
        super('article', {});
    }
    hasArticleId(key) {
        const map = this.store;
        return map[key] != null;
    }
    pushArticleId(key) {
        const map = this.store;
        map[key] = new Date().getTime();
        return this.setStore(map);
    }
}
const article = new Article();
exports.default = article;
//# sourceMappingURL=index.js.map