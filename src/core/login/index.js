const Base = require('../base');

class Login extends Base {
  async startLogin() {
    await this.page.goto('https://pc.xuexi.cn/points/login.html');

    const iframe = this.page.frames()[1];

    const isExpired = await iframe.evaluate(
      () => document.querySelectorAll('.zhuxiao')[0].style.display === 'none'
    );

    if (isExpired) {
      await this.page.evaluate(() => document.cookie = '');
      await this.page.goto('https://pc.xuexi.cn/points/login.html');
      const loginUrl = await this.page.evaluate(() => {
        const src = document
          .querySelector('#ddlogin-iframe')
          .src.split('?goto=')[1];
        return decodeURIComponent(src);
      });

      await this.page.goto(loginUrl);
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
