import Base, { IStartOpt } from '../base';
import ViStore from '@src/store/videx';
import { fetch20Videos } from '@src/api';
import { delay } from '@src/utils';
import dayjs from 'dayjs';

class VideoWatcher extends Base {
  sum = 0;
  time = 0;
  watchArr: string[] = [];
  async start({ sum, time }: IStartOpt, isHotTime?: boolean) {
    if (isHotTime) {
      this.sum = ((sum + 1) / 2) >>> 0; // 观看数
      this.time = (((time + 1) / 2) >>> 0) * 3; // 所需要的分钟数
    } else {
      this.time = time * 3;
      this.sum = sum;
    }

    if (this.sum < 1 && this.time < 1) return;
    console.log(`需要查看 ${this.sum} 个视频，花费 ${this.time} 分钟.`);

    this.watchArr = [];

    await this.getVideoByNews();

    if (this.watchArr.length >= this.sum) {
      console.log('已获取足够的视频link，开始watch...');
      await this.watchVideo();
    } else {
      console.log('视频 link 不够...');
    }
  }

  async watchVideo() {
    for (let i = 0, j = this.watchArr.length; i < j; i++) {
      const current = this.watchArr[i];
      await this.page.goto(current);

      await this.page.waitForSelector('.duration');

      const haveVideo = await this.page.evaluate(
        () => document.querySelectorAll('.prism-player').length > 0,
      );

      if (!haveVideo) continue;

      await this.page.evaluate(() => {
        function animateScroll(element: Element, speed: number) {
          const rect = element.getBoundingClientRect();
          //获取元素相对窗口的top值，此处应加上窗口本身的偏移
          const top = window.pageYOffset + rect.top;
          let currentTop = 0;
          let requestId: number;
          //采用requestAnimationFrame，平滑动画
          function step() {
            currentTop += speed;
            if (currentTop <= top) {
              window.scrollTo(0, currentTop);
              requestId = window.requestAnimationFrame(step);
            } else {
              window.cancelAnimationFrame(requestId);
            }
          }
          window.requestAnimationFrame(step);
        }
        const el = document.querySelectorAll('.prism-player')[0];
        if (el != null) animateScroll(el, 6);
      });

      let time;
      for (let i = 0; ; await delay(1000)) {
        time = await this.page.evaluate(() => {
          const el = document.querySelectorAll('.duration')[0];
          return el.textContent || '';
        });
        if (time !== '00:00') break;
        if (i++ > 30) throw new Error('时间查询失败');
      }

      await this.page.evaluate(() => {
        // 如果不在自动播放，就点一下
        const el = <HTMLElement>(
          document.querySelectorAll('.prism-big-play-btn')[0]
        );
        if (el.style.display === 'block') el.click();
      });

      console.log(`第 ${i + 1} 个, druation - ${time}.`);

      const timeArr = time.split(':');
      let duration = 0;

      if (timeArr.length === 2) {
        duration = +timeArr[0] * 60 + +timeArr[1];
      } else if (timeArr.length === 3) {
        duration = +timeArr[0] * 3600 + +timeArr[1] * 60 + +timeArr[2];
      }

      await delay(duration * 1001);
    }
    ViStore.save();
  }

  async getVideoByNews() {
    const list = await fetch20Videos();
    const listx = list.map((item: any) => {
      return {
        id: item.itemId,
        url: item.url,
      };
    });

    const needTime = this.time > 1;

    const lengthx = needTime ? this.sum - 1 : this.sum;

    if (lengthx > 0) {
      for (let i = 0, j = listx.length; i < j; i++) {
        const cur = listx[i];
        if (!ViStore.hasVideoId(cur.id) && !cur.id.includes('新闻联播')) {
          this.watchArr.push(cur.url);
          ViStore.pushVideoId(cur.id);
          if (this.watchArr.length >= lengthx) break;
        }
      }
    }

    if (needTime) {
      const xwlbLink =
        'https://www.xuexi.cn/8e35a343fca20ee32c79d67e35dfca90/7f9f27c65e84e71e1b7189b7132b4710.html';

      const before = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
      const get7daysBefore = `${xwlbLink}?p1=${before}`;
      this.watchArr.push(get7daysBefore);
    }
  }
}

export default VideoWatcher;
