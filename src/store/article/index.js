const Base = require('../base');

class Article extends Base {
  constructor() {
    super('article', {});
  }
  hasArticleId(key) {
    const map = this.store;
    return map[key] != null;
  }

  pushArticleId(key) {
    const map = this.store;
    map[key] = new Date().getTime(); // 因为添加了自动清理，所以value必须设置成时间戳
    return this.setStore(map);
  }
}

const article = new Article();

module.exports = article;