const { getState } = require('../../api');

const usedRules = [1, 2, 9, 1002, 1003];
class Work {
  // 每天6:00-8:30、12:00-14:00、20:00-22:30
  isHOTTIME() {
    const currentTime = new Date();
    const h = currentTime.getHours();
    return (6 <= h && h < 8) || (12 <= h && h < 14) || (20 <= h && h < 22);
  }

  async getWork() {
    const result = await getState();
    const used = result.data.filter(item => usedRules.includes(item.ruleId));

    const articleSum = used.find(item => item.ruleId === 1);
    const articleTime = used.find(item => item.ruleId === 1002);
    const needRead = articleSum.dayMaxScore - articleSum.currentScore;
    const needReadTime = articleTime.dayMaxScore - articleTime.currentScore;

    const videoSum = used.find(item => item.ruleId === 2);
    const videoSumTime = used.find(item => item.ruleId === 1003);
    const needWatch = videoSum.dayMaxScore - videoSum.currentScore;
    const needWatchTime = videoSumTime.dayMaxScore - videoSumTime.currentScore;

    return {
      article: {
        sum: needRead,
        time: needReadTime
      },
      video: {
        sum: needWatch,
        time: needWatchTime
      }
    };
  }
}

module.exports = Work;
