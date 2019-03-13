const Base = require('../base');

class Videx extends Base {
  constructor() {
    super('videx', {});
  }
  hasVidexId(key) {
    const map = this.store;
    return map[key] != null;
  }

  pushVidexId(key) {
    const map = this.store;
    map[key] = 1;
    return this.setStore(map);
  }
}

const videxo = new Videx();

module.exports = videxo;
