import Base from '../base';
import path from 'path';
import fs from 'fs';

import { delay, getRandomWaitTime } from '@src/utils';
import { getWeekQuestion } from '@src/api';

declare const getDomList: any;
declare const autoAnswer: () => Promise<void>;

class Question extends Base {
  content = fs
    .readFileSync(
      path.resolve(__dirname, '../../statics/question-injector.txt'),
    )
    .toString('utf-8');

  findWeekQuestions = async () => {
    const { list } = await getWeekQuestion();
    const curList: any[] = [];
    list.forEach(({ practices }: any) => {
      curList.push(...practices);
    });

    // https://pc.xuexi.cn/points/exam-weekly-detail.html?id=68
    const item = curList.find((i: any) => i.tipScore === 0);
    if (item == null) {
      console.log('所有题目均已答完');
      return '';
    }
    return `https://pc.xuexi.cn/points/exam-weekly-detail.html?id=${item.id}`;
  };

  getCurrentQuesProgress = async () => {
    return await this.page.evaluate(() => {
      const str = getDomList('.header-row .pager')?.[0]?.textContent;
      return str;
    });
  };

  autoAnswer = async () => {
    const count = await this.page.evaluate(() => {
      const str = getDomList('.header-row .pager')?.[0]?.textContent;
      const [cur, total] = str?.split('/') ?? [];
      const count = +total - +cur + 1;

      return count;
    });

    for (let i = 0; i < count; i++) {
      const currentProgress = await this.getCurrentQuesProgress();
      console.log(`当前答题进度：${currentProgress}`);

      await this.page.evaluate(() => autoAnswer());
      await delay(getRandomWaitTime(3000));
    }
    await this.page.waitForSelector('.practice-result');
    const points = await this.page.evaluate(() => {
      const result = getDomList('.ant-tooltip-open')[0].textContent;
      return result;
    });
    console.log('完成答题，得分：', points);
  };

  answerWeekly = async () => {
    const url = await this.findWeekQuestions();
    if (url.length < 1) return;
    await this.page.goto(url);

    await this.page.addScriptTag({ content: this.content });

    await delay(3000);
    await this.autoAnswer();
  };

  answerDaily = async () => {
    await this.page.goto('https://pc.xuexi.cn/points/exam-practice.html');

    await delay(3000);
    await this.page.addScriptTag({ content: this.content });

    await this.autoAnswer();
  };

  async start() {
    /** only support daily && weekly question */
    await this.answerWeekly();
    await delay(getRandomWaitTime(7000));
    await this.answerDaily();
  }
}

export default Question;
