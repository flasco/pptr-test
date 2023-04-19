import Base from '../base';

class VideoWatcher extends Base {
  constructor() {
    super('videx', {});
  }
  hasVideoId(key: string) {
    const map = this.store;
    return map[key] != null;
  }

  pushVideoId(key: string) {
    const map = this.store;
    map[key] = new Date().getTime(); // 因为添加了自动清理，所以value必须设置成时间戳
    return this.setStore(map);
  }
}

const videoWatcher = new VideoWatcher();

export default videoWatcher;
