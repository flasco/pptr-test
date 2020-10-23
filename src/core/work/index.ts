import { getState } from "../../api";

const usedRules = [1, 2, 9, 1002, 1003];

class Work {
  async getWork() {
    const result = await getState();
    if (result.dayScoreDtos == null) return null;
    const used = result.dayScoreDtos.filter((item: any) =>
      usedRules.includes(item.ruleId)
    );

    const article = used.find((item: any) => item.ruleId === 1);
    const vedio = used.find((item: any) => item.ruleId === 2);

    const articleTime = used.find((item: any) => item.ruleId === 1002);
    const needRead = getNeededSum(article);
    const needReadTime = articleTime.dayMaxScore - articleTime.currentScore;

    const videoSumTime = used.find((item: any) => item.ruleId === 1003);
    const needWatch = getNeededSum(vedio);
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

function getNeededSum({ dayMaxScore, currentScore }: any) {
  const needWatch = dayMaxScore - currentScore;
  if (needWatch < 1) return 0;
  return needWatch;
}
