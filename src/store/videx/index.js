const Base = require('../base');

class Videx extends Base {
  constructor() {
    super('videx', new Map());
  }
  hasVidexId(key) {
    const map = this.getStore();
    return map.has(key);
  }

  pushVidexId(key) {
    const map = this.getStore();
    map.set(key, 1);
    return this.setStore(map);
  }
}

const videxo = new Videx();

module.exports = videxo;
