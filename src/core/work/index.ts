import { getState, getptp } from '../../api';

const usedRules = [1, 2, 9, 1002, 1003];
const ptpTasks = ['1', '2'];

class Work {
  async getWork() {
    const result = await getState();
    const ptp = await getptp();
    if (result.dayScoreDtos == null) return null;
    if (ptp.taskProgressDtos == null) return null;
    const used = result.dayScoreDtos.filter((item: any) =>
      usedRules.includes(item.ruleId)
    );
    const ptpUsed = ptp.taskProgressDtos.filter((item: any) =>
      ptpTasks.includes(item.taskCode)
    );

    const ptpArticle = ptpUsed.find((item: any) => item.taskCode === '1');
    const ptpVedio = ptpUsed.find((item: any) => item.taskCode === '2');

    const articleTime = used.find((item: any) => item.ruleId === 1002);
    const needRead = getNeededSum(ptpArticle);
    const needReadTime = articleTime.dayMaxScore - articleTime.currentScore;

    const videoSumTime = used.find((item: any) => item.ruleId === 1003);
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

export default Work;

function getNeededSum({ maxCompletedCount, completedCount, target, progress }: any) {
  const needWatch = (maxCompletedCount - completedCount) * target;
  if (needWatch < 1) return 0;
  return needWatch - progress;
}
