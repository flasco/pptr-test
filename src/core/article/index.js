const Base = require('../base');

class Article extends Base {
  async start({ sum, time }, isHotTime) {
    if (isHotTime) {
      sum = (sum + 1) / 2 >>> 0; // 阅读数
      time = (time + 1) / 2 >>> 0 * 4; // 所需要的分钟数
    } else {
      time = time * 4;
    }
    console.log(`需要查看 ${sum} 篇文章，花费 ${time} 分钟.`);
  }
}

module.exports = Article;
