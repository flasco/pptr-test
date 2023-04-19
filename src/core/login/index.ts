import { writeFileSync } from 'fs';
import open from 'open';

import Base from '../base';
import { delay } from '@src/utils';

class Login extends Base {
  async startLogin() {
    await this.page.goto('https://pc.xuexi.cn/points/my-points.html');

    const isExpired = await this.page.evaluate(() => {
      const href = window.location.href;
      if (href.includes('points/login')) return true;
      const tipBox = document.querySelectorAll('.ant-modal-confirm-title');
      if (tipBox.length > 0) {
        const tips = tipBox[0].textContent || '';
        if (tips.includes('重新登录')) return true;
      }
      return false;
    });

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
      await delay(3000);
      await this.page.evaluate(() => {
        function straightScroll(element: Element) {
          const rect = element.getBoundingClientRect();
          //获取元素相对窗口的top值，此处应加上窗口本身的偏移
          const top = window.pageYOffset + rect.top;
          //采用requestAnimationFrame，平滑动画
          window.scrollTo(0, top);
        }
        const el = document.querySelectorAll('#ddlogin-iframe')[0];
        if (el != null) straightScroll(el);
      });

      const frame = this.page
        .frames()
        .find(i => i.url().includes('login.xuexi.cn'));

      const imgSrc = await frame!.evaluate(() => {
        const img = document.querySelectorAll(
          '#app .login_qrcode_content img',
        )[0] as HTMLImageElement;
        return img?.src;
      });

      if (!imgSrc) {
        throw new Error('登录二维码获取失败，请稍后重试。');
      }

      writeFileSync('login.png', dataURLtoBlob(imgSrc));

      await open('login.png');

      this.logWithNotify('请扫描登录二维码');
      await this.page.waitForNavigation({ timeout: 0 });
    }

    const curUrl = await this.page.evaluate(() => location.href);
    if (curUrl.includes('xuexi.cn')) {
      console.log('login succeed.');
      if (isExpired) {
        await this.saveCookies();
        console.log('save login state succeed');
      }
    }
  }
}

function dataURLtoBlob(dataURL: string) {
  const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

export default Login;
