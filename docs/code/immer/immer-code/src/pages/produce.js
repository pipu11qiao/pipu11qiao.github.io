import {
  DRAFT_STATE,
  NOTHING,
  assign,
  each,
  has,
  is,
  isDraft,
  isDraftable,
  isEnumerable,
  shallowCopy,
} from "../lib/common.js";

function createProxy(base, parent) {
  const state = {
    base,
    parent,
    modified: false,
    finalized: false,
    assigned: {},
    draft: null,
    drafts: {},
    copy: null,
  };
  const proxy = new Proxy(state, objectTraps);
  state.draft = proxy;
  return proxy;
}
function get(state, prop) {
  if (prop === DRAFT_STATE) return state;
  let { drafts } = state;

  // Check for existing draft in unmodified state.
  if (!state.modified && has(drafts, prop)) {
    return drafts[prop];
  }

  const value = source(state)[prop];
  if (state.finalized || !isDraftable(value)) return value;

  if (state.modified) {
    // Assigned values are never drafted. This catches any drafts we created, too.
    if (value !== state.base[prop]) return value;
    // Store drafts on the copy (when one exists).
    drafts = state.copy;
  }

  return (drafts[prop] = createProxy(value, state));
}
function deleteProperty(state, prop) {
  // debugger;
  if (state.base[prop] !== undefined || prop in state.base) {
    state.assigned[prop] = false;
    markChanged(state);
  }
  if (state.copy) delete state.copy[prop];
  return true;
}
function getOwnPropertyDescriptor(state, prop) {
  const owner = source(state);
  const desc = Reflect.getOwnPropertyDescriptor(owner, prop);
  if (desc) {
    desc.writable = true;
    desc.configurable = !Array.isArray(owner) || prop !== "length";
  }
  return desc;
}

// returns the object we should be reading the current value from, which is base, until some change has been made
function source(state) {
  return state.copy || state.base;
}

const objectTraps = {
  get,
  has(target, prop) {
    return prop in source(target);
  },
  ownKeys(target) {
    return Reflect.ownKeys(source(target));
  },
  set(target, prop, value) {
    Reflect.set(target, prop, value);
  },
  // set,
  deleteProperty,
  getOwnPropertyDescriptor,
  defineProperty() {
    throw new Error("Object.defineProperty() cannot be used on an Immer draft") // prettier-ignore
  },
  getPrototypeOf(target) {
    return Object.getPrototypeOf(target.base);
  },
  setPrototypeOf() {
    throw new Error("Object.setPrototypeOf() cannot be used on an Immer draft") // prettier-ignore
  },
};
function markChanged(state) {
  // debugger;
  if (!state.modified) {
    state.modified = true;
    // 将属性值换成proxy对象
    state.copy = assign(shallowCopy(state.base), state.drafts);
    state.drafts = null;
    if (state.parent) {
      markChanged(state.parent);
    }
  }
}

class Immer {
  constructor() {
    this.produce = this.produce.bind(this);
  }
  produce(baseState, reciver) {
    const proxyState = createProxy(baseState);
    reciver(proxyState);
    console.log("proxyState", JSON.stringify(proxyState[DRAFT_STATE]));
    console.log(
      "proxyState",
      JSON.stringify(proxyState[DRAFT_STATE].copy['box'][DRAFT_STATE])
    );
    debugger;
    // const res = this.processData(proxyState);
    // return res.copy;
    return baseState;
  }
  processData() {}
}
const immer = new Immer();
const produce = immer.produce;
export default produce;
