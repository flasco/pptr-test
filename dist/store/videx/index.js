"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_1 = tslib_1.__importDefault(require("../base"));
class Videx extends base_1.default {
    constructor() {
        super('videx', {});
    }
    hasVidexId(key) {
        const map = this.store;
        return map[key] != null;
    }
    pushVidexId(key) {
        const map = this.store;
        map[key] = new Date().getTime();
        return this.setStore(map);
    }
}
const videxo = new Videx();
exports.default = videxo;
//# sourceMappingURL=index.js.map