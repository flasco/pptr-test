import Base from '../base';
import path from 'path';
import fs from 'fs';
import { time as Logger } from '@flasco/logger';
import { delay } from '../../utils';
import { getWeekQuestion } from '../../api';

declare const getDomList: any;
declare const autoAnswer: () => Promise<void>;

class Question extends Base {
  content = fs
    .readFileSync(path.resolve(__dirname, './utils.js'))
    .toString('utf-8');

  findWeekQuestions = async () => {
    const { list } = await getWeekQuestion();
    const curList: any[] = [];
    list.forEach(({ practices }: any) => {
      curList.push(...practices);
    });

    // https://pc.xuexi.cn/points/exam-weekly-detail.html?id=68
    console.log(list);
    const item = curList.find((i: any) => i.tipScore === 0);
    if (item == null) {
      Logger.error('所有题目均已答完');
      return '';
    }
    return `https://pc.xuexi.cn/points/exam-weekly-detail.html?id=${item.id}`;
  };

  autoAnswer = async () => {
    const count = await this.page.evaluate(() => {
      const str = getDomList('.header-row .pager')[0].textContent;
      const [cur, total] = str?.split('/') ?? [];
      const count = +total - +cur + 1;

      return count;
    });

    Logger.info('需要答题:', count);

    for (let i = 0; i < count; i++) {
      await this.page.evaluate(() => autoAnswer());
      await delay(Math.round(2000 + Math.random() * 2000));
    }
    await this.page.waitForSelector('.practice-result');
    const points = await this.page.evaluate(() => {
      const result = getDomList('.ant-tooltip-open')[0].textContent;
      return result;
    });
    Logger.success('完成答题，得分：', points);
  };

  answerWeekly = async () => {
    const url = await this.findWeekQuestions();
    if (url.length < 1) return;
    await this.page.goto(url);

    await this.page.addScriptTag({ content: this.content });

    await this.autoAnswer();
  };

  answerDaily = async () => {
    await this.page.goto('https://pc.xuexi.cn/points/exam-practice.html');

    await this.page.addScriptTag({ content: this.content });

    await this.autoAnswer();
  };

  async start() {
    await this.answerWeekly();
    await delay(7000 + Math.round(Math.random() * 2000));
    await this.answerDaily();
  }
}

export default Question;
