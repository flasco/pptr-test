import Base from "../base";
import path from "path";
import fs from "fs";
import { time as Logger } from "@flasco/logger";
import { delay } from "../../utils";

declare const getDomList: any;
declare const autoAnswer: () => Promise<void>;

class Question extends Base {
  async start() {
    await this.page.goto("https://pc.xuexi.cn/points/exam-practice.html");

    const content = fs
      .readFileSync(path.resolve(__dirname, "./utils.js"))
      .toString("utf-8");

    await this.page.addScriptTag({
      content,
    });

    const count = await this.page.evaluate(() => {
      const str = getDomList(".header-row .pager")[0].textContent;
      const [cur, total] = str?.split("/") ?? [];
      const count = +total - +cur + 1;

      return count;
    });

    Logger.info("需要答题:", count);

    for (let i = 0; i < count; i++) {
      await this.page.evaluate(() => autoAnswer());
      await delay(2000);
    }
  }
}

export default Question;
