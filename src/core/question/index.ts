import Base from '../base';
import path from 'path';
import fs from 'fs';

import { delay } from '@src/utils';
import { getSpecialExam, getWeekQuestion } from '@src/api';

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

  findSpecialQuestions = async () => {
    const item = await getSpecialExam();

    if (item == null) {
      return '';
    }

    return `https://pc.xuexi.cn/points/exam-paper-detail.html?id=${item.id}`;
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
      await delay(3000);
    }

    await this.page.waitForSelector('.practice-result');

    const points = await this.page.evaluate(() => {
      const result = getDomList('.ant-tooltip-open')[0].textContent;
      return result;
    });
    console.log('完成答题，得分：', points);
  };

  answerWeekly = async () => {
    console.log('weekly answer.');
    const url = await this.findWeekQuestions();
    if (url.length < 1) return;
    await this.page.goto(url);

    await this.page.addScriptTag({ content: this.content });

    await delay(3000);
    await this.autoAnswer();
  };

  answerSpecial = async () => {
    console.log('special answer.');
    const url = await this.findSpecialQuestions();
    if (url.length < 1) return;
    await this.page.goto(url);

    await this.page.addScriptTag({ content: this.content });

    await delay(3000);
    await this.autoAnswer();
  };

  answerDaily = async () => {
    console.log('daily answer.');
    await this.page.goto('https://pc.xuexi.cn/points/exam-practice.html');

    await delay(3000);
    await this.page.addScriptTag({ content: this.content });

    await this.autoAnswer();
  };

  async start(question: { dailySum: number; specialSum: number }) {
    const { dailySum, specialSum } = question;
    if (dailySum > 0) {
      await this.answerDaily().catch(e => console.log(e));
      await delay(7000);
    }

    if (specialSum > 0) {
      // await this.answerWeekly().catch(e => console.log(e));
      // await delay(7000);
      await this.answerSpecial().catch(e => console.log(e));
      await delay(7000);
    }
  }
}

export default Question;
