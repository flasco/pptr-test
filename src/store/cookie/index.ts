import { time as Logger} from '@flasco/logger';
import Base from '../base';

class Cookie extends Base {
  constructor() {
    super('cookie', { str: '', time: 0 });
  }
  getCookie() {
    const store = this.getStore();
    const time = <number>(store.time || 0);
    if (Date.now() - time > 3600000 * 5) {
      Logger.info('cookie 存储时长超过五小时，请重新登录');
      return '';
    }
    return store.str;
  }

  setCookie(str: string) {
    this.store.str = str;
    this.store.time = Date.now();
    this.setStore(this.store);
    this.save();
  }
}

const newX = new Cookie();

export default newX;
