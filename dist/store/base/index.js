"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const appdata_path_1 = tslib_1.__importDefault(require("appdata-path"));
const logger_1 = require("@flasco/logger");
const utils_1 = require("../../utils");
const dataPath = appdata_path_1.default('pptr-test');
utils_1.checkDirExist(dataPath);
class Store {
    constructor(name, initialValue = {}) {
        this.name = name;
        this.storePath = path_1.default.resolve(dataPath, `./${name}.json`);
        const existFlag = utils_1.isExist(this.storePath);
        this.store = existFlag ? require(this.storePath) : initialValue;
    }
    getStore() {
        return this.store;
    }
    setStore(store) {
        const keys = Object.keys(store);
        if (keys.length > 1000) {
            logger_1.time.info(`检测到 ${this.name} 存储过千，开始清理...`);
            let cleaned = 0;
            const needClean = keys.length - 200;
            keys.every(key => {
                if (cleaned >= needClean)
                    return false;
                if (store[key] < new Date().getTime() - 1000 * 60 * 60 * 24 * 7) {
                    cleaned++;
                    delete store[key];
                    return true;
                }
                else {
                    return false;
                }
            });
            logger_1.time.info('清理完毕，当前剩余', Object.keys(store).length, '条');
        }
        this.store = store;
    }
    save() {
        utils_1.writeFileSync(this.storePath, this.store);
    }
}
exports.default = Store;
//# sourceMappingURL=index.js.map