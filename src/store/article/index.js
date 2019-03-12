const Base = require('../base');

class Article extends Base {
  constructor() {
    super('article', new Map());
  }
  hasArticleId(key) {
    const map = this.getStore();
    return map.has(key);
  }

  pushArticleId(key) {
    const map = this.getStore();
    map.set(key, 1);
    return this.setStore(map);
  }
}

const article = new Article();

exports.hasArticleId = article.hasArticleId;
exports.pushArticleId = article.pushArticleId;
