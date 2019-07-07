import { time as Logger } from '@flasco/logger';

import Base from '../base';

class Login extends Base {
  async startLogin(isExpired: boolean) {
    await this.page.goto('https://pc.xuexi.cn/points/my-points.html');

    if (isExpired == null) {
      isExpired = await this.page.evaluate(() => {
        const href = window.location.href;
        if (href.includes('points/login')) return true;
        const tipBox = document.querySelectorAll('.ant-modal-confirm-title');
        if (tipBox.length > 0) {
          const tips = tipBox[0].textContent || '';
          if (tips.includes('重新登录')) return true;
        }
        return false;
      });
    }

    if (isExpired) {
      await this.page.evaluate(() => {
        document.cookie = '';
        const href = window.location.href;
        if (!href.includes('points/login')) {
          window.location.href =
            'https://pc.xuexi.cn/points/login.html?ref=https://pc.xuexi.cn/points/my-points.html';
        }
      });
      await this.page.waitForSelector('#ddlogin-iframe');
      await this.page.evaluate(() => {
        function striaightScroll(element: Element) {
          let rect = element.getBoundingClientRect();
          //获取元素相对窗口的top值，此处应加上窗口本身的偏移
          let top = window.pageYOffset + rect.top;
          //采用requestAnimationFrame，平滑动画
          window.scrollTo(0, top);
        }
        const el = document.querySelectorAll('#ddlogin-iframe')[0];
        if (el != null) striaightScroll(el);
      });

      this.log('请扫描登录二维码');
      await this.page.waitForNavigation({ timeout: 0 });
    }

    const curUrl = await this.page.evaluate(() => location.href);
    if (curUrl.includes('xuexi.cn')) {
      Logger.success('login succeed.');
      if (isExpired) {
        await this.saveCookies();
        Logger.success('save login state succeed');
      }
    }
  }
}

export default Login;
