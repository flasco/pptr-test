import axios from 'axios';
import Cookie from '@src/store/cookie';

axios.interceptors.request.use(
  config => {
    const cookie = Cookie.getCookie(); //获取Cookie
    config.headers['Cookie'] = cookie;
    return config;
  },
  err => {
    return Promise.reject(err);
  },
);

export async function fetch20News() {
  const url = 'https://www.xuexi.cn/lgdata/1crqb964p71.json';
  const { data } = await axios.get(url);
  return data;
}

export async function fetch20Videos() {
  const url = 'https://www.xuexi.cn/lgdata/1novbsbi47k.json';
  const { data } = await axios.get(url);
  return data;
}

export async function getWeekQuestion() {
  const url =
    'https://pc-proxy-api.xuexi.cn/api/exam/service/practice/pc/weekly/more?pageNo=1&pageSize=900';
  const { data } = await axios.get(url);
  const { data_str } = data;
  const curData = Buffer.from(data_str, 'base64').toString('utf-8');
  return JSON.parse(curData);
}

export const getSpecialExam = async () => {
  let pageNo = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const url = `https://pc-proxy-api.xuexi.cn/api/exam/service/paper/pc/list?pageSize=50&pageNo=${pageNo}`;

    const { data } = await axios.get(url);
    const curData = JSON.parse(
      Buffer.from(data.data_str, 'base64').toString('utf-8'),
    );

    const noAnsweredExam = curData.list.filter(i => i.tipScore === 0).pop();

    if (noAnsweredExam) {
      return noAnsweredExam;
    }

    if (pageNo < curData.totalPageCount) {
      pageNo += 1;
    } else {
      console.log('无可供作答的专项，跳过。');
      break;
    }
  }

  return null;
};

enum TaskIds {
  readArticleTime = '193549965443299840',
  watchCount = '193551054368504064',
  watchTime = '193551711926319360',
  dailyQuestion = '193552647163836928',
  specialQuestion = '193561952390838784',
}

const usedRules = Object.values(TaskIds) as string[];

export const getTaskProgress = async () => {
  const {
    data: { data },
  } = await axios.get(
    'https://pc-proxy-api.xuexi.cn/delegate/score/days/listScoreProgress?sence=score&deviceType=2',
  );

  const { taskProgress } = data as {
    taskProgress: Array<{
      dayMaxScore: number;
      currentScore: number;
      displayRuleId: string;
    }>;
  };
  if (!Array.isArray(taskProgress)) {
    return null;
  }

  const supportedTasks = taskProgress.filter(item =>
    usedRules.includes(item.displayRuleId),
  );

  const video = supportedTasks.find(
    item => item.displayRuleId === TaskIds.watchCount,
  );

  const articleTime = supportedTasks.find(
    item => item.displayRuleId === TaskIds.readArticleTime,
  );

  /** 现在阅读数和阅读时间是合并成一个指标了，不过还是累计 6 个 */
  const needReadTime = articleTime.dayMaxScore - articleTime.currentScore;

  const videoSumTime = supportedTasks.find(
    item => item.displayRuleId === TaskIds.watchTime,
  );

  function getNeededSum({ dayMaxScore, currentScore }) {
    const needWatch = dayMaxScore - currentScore;
    if (needWatch < 1) return 0;
    return needWatch;
  }

  const needWatch = getNeededSum(video);
  const needWatchTime = videoSumTime.dayMaxScore - videoSumTime.currentScore;

  const dailyQuestion = supportedTasks.find(
    item => item.displayRuleId === TaskIds.dailyQuestion,
  );

  const specialQuestion = supportedTasks.find(
    i => i.displayRuleId === TaskIds.specialQuestion,
  );

  return {
    article: {
      sum: Math.round(needReadTime / 2),
      time: Math.round(needReadTime / 2),
    },
    video: {
      sum: needWatch,
      time: needWatchTime,
    },
    question: {
      dailySum: dailyQuestion.dayMaxScore - dailyQuestion.currentScore,
      specialSum: specialQuestion.dayMaxScore - specialQuestion.currentScore,
    },
  };
};

export const getCurrentScore = async () => {
  const {
    data: { data },
  } = await axios.get(
    `https://pc-proxy-api.xuexi.cn/delegate/score/get?_t=${Date.now()}`,
  );

  return data.score;
};

export const getTodayEarnedScore = async () => {
  const {
    data: { data },
  } = await axios.get(
    'https://pc-proxy-api.xuexi.cn/delegate/score/today/query',
  );

  return data.score;
};
