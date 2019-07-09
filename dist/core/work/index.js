"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../api");
const usedRules = [1, 2, 9, 1002, 1003];
const ptpTasks = ['1', '2'];
class Work {
    async getWork() {
        const result = await api_1.getState();
        const ptp = await api_1.getptp();
        if (result.dayScoreDtos == null)
            return null;
        if (ptp.taskProgressDtos == null)
            return null;
        const used = result.dayScoreDtos.filter((item) => usedRules.includes(item.ruleId));
        const ptpUsed = ptp.taskProgressDtos.filter((item) => ptpTasks.includes(item.taskCode));
        const ptpArticle = ptpUsed.find((item) => item.taskCode === '1');
        const ptpVedio = ptpUsed.find((item) => item.taskCode === '2');
        const articleTime = used.find((item) => item.ruleId === 1002);
        const needRead = getNeededSum(ptpArticle);
        const needReadTime = articleTime.dayMaxScore - articleTime.currentScore;
        const videoSumTime = used.find((item) => item.ruleId === 1003);
        const needWatch = getNeededSum(ptpVedio);
        const needWatchTime = videoSumTime.dayMaxScore - videoSumTime.currentScore;
        return {
            article: {
                sum: needRead,
                time: needReadTime,
            },
            video: {
                sum: needWatch,
                time: needWatchTime,
            },
        };
    }
}
exports.default = Work;
function getNeededSum({ maxCompletedCount, completedCount, target, progress }) {
    const needWatch = (maxCompletedCount - completedCount) * target;
    if (needWatch < 1)
        return 0;
    return needWatch - progress;
}
//# sourceMappingURL=index.js.map