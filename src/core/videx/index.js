const Base = require('../base');

const ViStore = require('../../store/videx');

const { fetch20Vedios } = require('../../api');

class Videx extends Base {
  constructor(...props) {
    super(...props);
    this.watchArr = [];
  }
  async start({ sum, time }, isHotTime) {
    if (isHotTime) {
      this.sum = ((sum + 1) / 2) >>> 0; // 观看数
      this.time = (((time + 1) / 2) >>> 0) * 5; // 所需要的分钟数
    } else {
      this.time = time * 8;
      this.sum = sum;
    }

    if (this.sum < 1 && this.time < 1) return;
    console.log(`需要查看 ${this.sum} 个视频，花费 ${this.time} 分钟.`);

    // await this.getVidexByNews();
    this.watchArr.push(
      'https://www.xuexi.cn/45567be569610decf8db1e9eae5f7b6c/cf94877c29e1c685574e0226618fb1be.html'
    );
    await this.watchVidex();
    // if (this.watchArr.length >= this.sum) {
    //   console.log('已获取足够的视频link，开始watch...');
    // }
  }

  async watchVidex() {
    for (let i = 0, j = this.watchArr.length; i < j; i++) {
      const current = this.watchArr[i];
      await this.page.goto(current);

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
        animateScroll(el, 6);
      });

      const time = await this.page.evaluate(() => {
        const el = document.querySelectorAll('.duration')[0];
        return el.textContent;
      });

      console.log(`第 ${i + 1} 个, druation - ${time}.`);

      const timeArr = time.split(':');
      let duration = 0;

      if (timeArr.length === 2) {
        duration = +timeArr[0] * 60 + +timeArr[1];
      } else if (timeArr.length === 3) {
        duration = +timeArr[0] * 3600 + +timeArr[1] * 60 + +timeArr[2];
      }

      await this.page.waitFor(duration * 1000);
    }
  }

  async getVidexByNews() {
    const list = await fetch20Vedios();
    const listx = list.map(item => {
      return {
        id: item.frst_name,
        url: item.static_page_url
      };
    });
    for (let i = 0, j = listx.length; i < j; i++) {
      const cur = listx[i];
      if (!ViStore.hasVidexId(cur.id)) {
        this.watchArr.push(cur.url);
        ViStore.pushVidexId(cur.id);
        if (this.watchArr.length >= this.sum - 1) break;
      }
    }
  }
}

module.exports = Videx;
