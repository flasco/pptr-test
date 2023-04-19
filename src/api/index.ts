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

enum TaskIds {
  readArticleTime = '193549965443299840',
  watchCount = '193551054368504064',
  watchTime = '193551711926319360',
  dailyQuestion = '193552647163836928',
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
      sum: dailyQuestion.dayMaxScore - dailyQuestion.currentScore,
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
