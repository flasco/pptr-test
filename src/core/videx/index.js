const formatDate = require('date-fns/format');

const Base = require('../base');

const ViStore = require('../../store/videx');

const { fetch20Vedios } = require('../../api');

class Videx extends Base {
  async start({ sum, time }, isHotTime) {
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

    await this.getVidexByNews();

    if (this.watchArr.length >= this.sum) {
      console.log('已获取足够的视频link，开始watch...');
      await this.watchVidex();
    } else {
      console.log('视频 link 不够...');
    }
  }

  async watchVidex() {
    for (let i = 0, j = this.watchArr.length; i < j; i++) {
      const current = this.watchArr[i];
      await this.page.goto(current);

      const haveVideo = await this.page.evaluate(() => document.querySelectorAll('.prism-player').length > 0);

      if (!haveVideo) continue;

      await this.page.evaluate(() => {
        function animateScroll(element, speed) {
          let rect = element.getBoundingClientRect();
          //获取元素相对窗口的top值，此处应加上窗口本身的偏移
          let top = window.pageYOffset + rect.top;
          let currentTop = 0;
          let requestId;
          //采用requestAnimationFrame，平滑动画
          function step(timestamp) {
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

      const time = await this.page.evaluate(() => {
        const el = document.querySelectorAll('.duration')[0];
        return el.textContent;
      });

      await this.page.evaluate(() => {
        // 如果不在自动播放，就点一下
        const el = document.querySelectorAll('.prism-big-play-btn')[0];
        if (el.style.display === 'block') el.click();
      })

      console.log(`第 ${i + 1} 个, druation - ${time}.`);

      const timeArr = time.split(':');
      let duration = 0;

      if (timeArr.length === 2) {
        duration = +timeArr[0] * 60 + +timeArr[1];
      } else if (timeArr.length === 3) {
        duration = +timeArr[0] * 3600 + +timeArr[1] * 60 + +timeArr[2];
      }

      await this.page.waitFor(duration * 1001);
    }
    ViStore.save();
  }

  async getVidexByNews() {
    const list = await fetch20Vedios();
    const listx = list.map(item => {
      return {
        id: item.frst_name,
        url: item.static_page_url
      };
    });

    const needTime = this.time > 1;

    const lengthx = needTime ? this.sum - 1 : this.sum;

    if (lengthx > 0) {
      for (let i = 0, j = listx.length; i < j; i++) {
        const cur = listx[i];
        if (!ViStore.hasVidexId(cur.id) && !cur.id.includes('新闻联播')) {
          this.watchArr.push(cur.url);
          ViStore.pushVidexId(cur.id);
          if (this.watchArr.length >= lengthx) break;
        }
      }
    }

    if (needTime) {
      const xwlbLink =
        'https://www.xuexi.cn/8e35a343fca20ee32c79d67e35dfca90/7f9f27c65e84e71e1b7189b7132b4710.html';
      const before = formatDate(Date.now() - 24 * 3600000 * 7, 'YYYY-MM-DD');
      const get7daysBefore = `${xwlbLink}?p1=${before}`;
      this.watchArr.push(get7daysBefore);
    }
  }
}

module.exports = Videx;
