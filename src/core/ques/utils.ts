function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

interface AnyElement extends Element {
  [key: string]: any;
}

const getDomList = (query: string) => {
  const lists = document.querySelectorAll(query);
  return Array.from(lists) as AnyElement[];
};

async function getTips() {
  let tips = [...getDomList(".line-feed font[color=red]")];
  if (tips.length < 1) {
    getDomList(".q-footer span")[0]?.click();
    await delay(900);
    tips = [...getDomList(".line-feed font[color=red]")];
  }

  const results = tips.map((i) => i.textContent!.trim());
  return results;
}

async function autoAnswer() {
  const results = await getTips();

  const chooseResolver = async () => {
    const chooses = [...getDomList(".question .q-answers .choosable")];
    if (chooses.length > 0) {
      for (let i = 0; i < chooses.length; i++) {
        const item = chooses[i];
        const haveIt = results.some((key) => item.textContent!.includes(key));
        if (haveIt) item.click();
        await delay(600);
      }
    }
  };
  const chooseMap: Record<string, () => Promise<void>> = {
    填空: async () => {
      const inputs = [...getDomList(".q-body .blank")];
      for (let i = 0; i < inputs.length; i++) {
        inputText2React(inputs[i], results[i]);
        await delay(500);
      }
    },
    单选: chooseResolver,
    多选: chooseResolver,
  };

  const type = getDomList(".q-header")[0].textContent!.split("题")[0];

  const func = chooseMap[type];

  if (func == null) throw new Error(`异常，不认识的题目！, ${type}`);
  await func();

  getDomList(".action-row button")[0].click();
}

function inputText2React(dom: any, str: string) {
  let lastValue = dom.value;
  dom.value = str;
  let event = new Event("input", { bubbles: true });
  // hack React16 内部定义了descriptor拦截value，此处重置状态
  let tracker = dom._valueTracker;
  if (tracker) {
    tracker.setValue(lastValue);
  }
  dom.dispatchEvent(event);
}
