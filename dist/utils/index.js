"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const os_1 = require("os");
const isWin = os_1.platform().startsWith('win');
function isExist(filePath) {
    return fs_1.default.existsSync(filePath);
}
exports.isExist = isExist;
function checkDirExist(folderpath) {
    if (isWin) {
        const pathArr = folderpath.split('\\');
        let _path = '';
        for (let i = 0; i < pathArr.length; i++) {
            if (pathArr[i]) {
                _path += (isWin && i === 0 ? '' : '\\') + pathArr[i];
                if (!fs_1.default.existsSync(_path)) {
                    fs_1.default.mkdirSync(_path);
                }
            }
        }
    }
    else {
        const pathArr = folderpath.split('/');
        let _path = '';
        for (let i = 0; i < pathArr.length; i++) {
            if (pathArr[i]) {
                _path += `/${pathArr[i]}`;
                if (!fs_1.default.existsSync(_path)) {
                    fs_1.default.mkdirSync(_path);
                }
            }
        }
    }
}
exports.checkDirExist = checkDirExist;
function writeFileSync(filePath, content) {
    return fs_1.default.writeFileSync(filePath, JSON.stringify(content, null, 2));
}
exports.writeFileSync = writeFileSync;
exports.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
//# sourceMappingURL=index.js.map