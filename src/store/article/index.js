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
    map[key] = 1;
    return this.setStore(map);
  }
}

const article = new Article();

module.exports = article;