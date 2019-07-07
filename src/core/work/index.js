const { getState, getptp } = require('../../api');

const usedRules = [1, 2, 9, 1002, 1003];
const ptpTasks = ['1', '2'];
class Work {
  // 每天6:00-8:30、12:00-14:00、20:00-22:30
  isHOTTIME() {
    const currentTime = new Date();
    const h = currentTime.getHours();
    return (6 <= h && h < 8) || (12 <= h && h < 14) || (20 <= h && h < 22);
  }

  async getWork() {
    const result = await getState();
    const ptp = await getptp();
    if (result.dayScoreDtos == null) return null;
    if (ptp.taskProgressDtos == null) return null;
    const used = result.dayScoreDtos.filter(item =>
      usedRules.includes(item.ruleId)
    );
    const ptpUsed = ptp.taskProgressDtos.filter(item =>
      ptpTasks.includes(item.taskCode)
    );

    const ptpArticle = ptpUsed.find(item => item.taskCode === '1');
    const ptpVedio = ptpUsed.find(item => item.taskCode === '2');

    const articleTime = used.find(item => item.ruleId === 1002);
    const needRead = getNeededSum(ptpArticle);
    const needReadTime = articleTime.dayMaxScore - articleTime.currentScore;

    const videoSumTime = used.find(item => item.ruleId === 1003);
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

module.exports = Work;

function getNeededSum({ maxCompletedCount, completedCount, target, progress }) {
  return (maxCompletedCount - completedCount) * target - progress;
}
