const Base = require('../base');

class Login extends Base {
  async startLogin() {
    await this.page.goto('https://pc.xuexi.cn/points/login.html?ref=https%3A%2F%2Fwww.xuexi.cn%2F');

    const iframe = this.page.frames()[1];

    const isExpired = await iframe.evaluate(
      () => document.querySelectorAll('.zhuxiao')[0].style.display === 'none'
    );

    if (isExpired) {
      await this.page.evaluate(() => document.cookie = '');
      await this.page.goto('https://pc.xuexi.cn/points/login.html?ref=https%3A%2F%2Fwww.xuexi.cn%2F');
      await this.page.waitForSelector('#ddlogin-iframe');
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
        const el = document.querySelectorAll('#ddlogin-iframe')[0];
        if (el != null) animateScroll(el, 6);
      });

      this.log('请扫描登录二维码');
      await this.page.waitForNavigation({ timeout: 0 });
    }

    const curUrl = await this.page.evaluate(() => location.href);
    if (curUrl.includes('my-study')) {
      console.log('success login.');
      if (isExpired) {
        await this.saveCookies();
        console.log('save login state succeed');
      }
    }
  }
}

module.exports = Login;
