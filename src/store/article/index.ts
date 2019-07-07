import Base from '../base';

class Article extends Base {
  constructor() {
    super('article', {});
  }
  hasArticleId(key: string) {
    const map = this.store;
    return map[key] != null;
  }

  pushArticleId(key: string) {
    const map = this.store;
    map[key] = new Date().getTime(); // 因为添加了自动清理，所以value必须设置成时间戳
    return this.setStore(map);
  }
}

const article = new Article();

export default article;
