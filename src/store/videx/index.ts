import Base from '../base';

class Videx extends Base {
  constructor() {
    super('videx', {});
  }
  hasVidexId(key: string) {
    const map = this.store;
    return map[key] != null;
  }

  pushVidexId(key: string) {
    const map = this.store;
    map[key] = new Date().getTime(); // 因为添加了自动清理，所以value必须设置成时间戳
    return this.setStore(map);
  }
}

const videxo = new Videx();

export default videxo;
