import Base from '../base';
import path from 'path';
import fs from 'fs';

import { delay } from '@src/utils';

declare const getDomList: any;
declare const autoAnswer: () => Promise<void>;

class Question extends Base {
  content = fs
    .readFileSync(
      path.resolve(__dirname, '../../statics/question-injector.txt'),
    )
    .toString('utf-8');

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

  answerDaily = async () => {
    console.log('daily answer.');
    await this.page.goto('https://pc.xuexi.cn/points/exam-practice.html');

    await delay(3000);
    await this.page.addScriptTag({ content: this.content });

    await this.autoAnswer();
  };

  async start(question: { dailySum: number }) {
    const { dailySum } = question;
    if (dailySum > 0) {
      await this.answerDaily().catch(e => console.log(e));
    }
  }
}

export default Question;
