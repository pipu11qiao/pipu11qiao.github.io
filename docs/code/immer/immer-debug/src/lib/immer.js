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
} from './common';

/** Each scope represents a `produce` call. */
export class ImmerScope {
  constructor(parent) {
    this.drafts = [];
    this.parent = parent;

    // Whenever the modified draft contains a draft from another scope, we
    // need to prevent auto-freezing so the unowned draft can be finalized.
    this.canAutoFreeze = true;

    // To avoid prototype lookups:
    this.patches = null;
  }
  revoke() {
    this.leave();
    this.drafts.forEach(revoke);
    this.drafts = null; // Make draft-related methods throw.
  }
  leave() {
    if (this === ImmerScope.current) {
      ImmerScope.current = this.parent;
    }
  }
}

ImmerScope.current = null;
ImmerScope.enter = function () {
  return (this.current = new ImmerScope(this.current));
};

function revoke(draft) {
  draft[DRAFT_STATE].revoke();
}

// Do nothing before being finalized.
export function willFinalize() {}

export function createProxy(base, parent) {
  const scope = parent ? parent.scope : ImmerScope.current;
  const state = {
    // Track which produce call this is associated with.
    scope,
    // True for both shallow and deep changes.
    modified: false,
    // Used during finalization.
    finalized: false,
    // Track which properties have been assigned (true) or deleted (false).
    assigned: {},
    // The parent draft state.
    parent,
    // The base state.
    base,
    // The base proxy.
    draft: null,
    // Any property proxies.
    drafts: {},
    // The base copy with any updated values.
    copy: null,
    // Called by the `produce` function.
    revoke: null,
  };

  const { revoke, proxy } = Array.isArray(base)
    ? // [state] is used for arrays, to make sure the proxy is array-ish and not violate invariants,
      // although state itself is an object
      Proxy.revocable([state], arrayTraps)
    : Proxy.revocable(state, objectTraps);

  state.draft = proxy;
  state.revoke = revoke;

  scope.drafts.push(proxy);
  return proxy;
}

const objectTraps = {
  get,
  has(target, prop) {
    return prop in source(target);
  },
  ownKeys(target) {
    return Reflect.ownKeys(source(target));
  },
  set,
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

const arrayTraps = {};
each(objectTraps, (key, fn) => {
  arrayTraps[key] = function () {
    arguments[0] = arguments[0][0];
    return fn.apply(this, arguments);
  };
});
arrayTraps.deleteProperty = function (state, prop) {
  if (isNaN(parseInt(prop))) {
    throw new Error("Immer only supports deleting array indices") // prettier-ignore
  }
  return objectTraps.deleteProperty.call(this, state[0], prop);
};
arrayTraps.set = function (state, prop, value) {
  if (prop !== 'length' && isNaN(parseInt(prop))) {
    throw new Error("Immer only supports setting array indices and the 'length' property") // prettier-ignore
  }
  return objectTraps.set.call(this, state[0], prop, value);
};

// returns the object we should be reading the current value from, which is base, until some change has been made
function source(state) {
  return state.copy || state.base;
}

function get(state, prop) {
  // debugger
  if (prop === DRAFT_STATE) return state;
  let { drafts } = state;

  // Check for existing draft in unmodified state.
  if (!state.modified && has(drafts, prop)) {
    return drafts[prop];
  }

  const value = source(state)[prop];
  if (state.finalized || !isDraftable(value)) return value;

  // Check for existing draft in modified state.
  if (state.modified) {
    // Assigned values are never drafted. This catches any drafts we created, too.
    if (value !== state.base[prop]) return value;
    // Store drafts on the copy (when one exists).
    drafts = state.copy;
  }

  return (drafts[prop] = createProxy(value, state));
}

function set(state, prop, value) {
  // debugger;
  if (!state.modified) {
    // Optimize based on value's truthiness. Truthy values are guaranteed to
    // never be undefined, so we can avoid the `in` operator. Lastly, truthy
    // values may be drafts, but falsy values are never drafts.
    const isUnchanged = value
      ? is(state.base[prop], value) || value === state.drafts[prop]
      : is(state.base[prop], value) && prop in state.base;
    if (isUnchanged) return true;
    markChanged(state);
  }
  state.assigned[prop] = true;
  state.copy[prop] = value;
  return true;
}

function deleteProperty(state, prop) {
  // The `undefined` check is a fast path for pre-existing keys.
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
    desc.configurable = !Array.isArray(owner) || prop !== 'length';
  }
  return desc;
}

function markChanged(state) {
  if (!state.modified) {
    state.modified = true;
    state.copy = assign(shallowCopy(state.base), state.drafts);
    state.drafts = null;
    if (state.parent) markChanged(state.parent);
  }
}

function verifyMinified() {}

const configDefaults = {
  useProxies: typeof Proxy !== 'undefined' && typeof Reflect !== 'undefined',
  autoFreeze:
    typeof process !== 'undefined'
      ? process.env.NODE_ENV !== 'production'
      : verifyMinified.name === 'verifyMinified',
  onAssign: null,
  onDelete: null,
  onCopy: null,
};

const modernProxy = {
  createProxy,
};

export class Immer {
  constructor(config) {
    assign(this, configDefaults, config);
    this.setUseProxies(this.useProxies);
    this.produce = this.produce.bind(this);
  }
  produce(base, recipe) {
    // debugger;
    let result;
    // Only plain objects, arrays, and "immerable classes" are drafted.
    if (isDraftable(base)) {
      const scope = ImmerScope.enter();
      const proxy = this.createProxy(base);
      let hasError = true;
      try {
        result = recipe.call(proxy, proxy);
        hasError = false;
      } finally {
        // finally instead of catch + rethrow better preserves original stack
        if (hasError) scope.revoke();
        else scope.leave();
      }
      return this.processResult(result, scope);
    } else {
      result = recipe(base);
      if (result === undefined) return base;
      return result !== NOTHING ? result : undefined;
    }
  }
  setUseProxies(value) {
    this.useProxies = value;
    assign(this, modernProxy);
  }
  /** @internal */
  processResult(result, scope) {
    const baseDraft = scope.drafts[0];
    // Finalize the base draft.
    // eslint-disable-next-line no-param-reassign
    result = this.finalize(baseDraft, [], scope);
    scope.revoke();
    return result !== NOTHING ? result : undefined;
  }
  /**
   * @internal
   * Finalize a draft, returning either the unmodified base state or a modified
   * copy of the base state.
   */
  finalize(draft, path, scope) {
    // debugger;
    const state = draft[DRAFT_STATE];
    if (!state) {
      if (Object.isFrozen(draft)) return draft;
      return this.finalizeTree(draft, null, scope);
    }
    // Never finalize drafts owned by another scope.
    if (state.scope !== scope) {
      return draft;
    }
    if (!state.modified) {
      return state.base;
    }
    if (!state.finalized) {
      state.finalized = true;
      this.finalizeTree(state.draft, path, scope);

      if (this.onDelete) {
        // The `assigned` object is unreliable with ES5 drafts.
        if (this.useProxies) {
          const { assigned } = state;
          for (const prop in assigned) {
            if (!assigned[prop]) this.onDelete(state, prop);
          }
        } else {
          const { base, copy } = state;
          each(base, (prop) => {
            if (!has(copy, prop)) this.onDelete(state, prop);
          });
        }
      }
      if (this.onCopy) {
        this.onCopy(state);
      }

      // At this point, all descendants of `state.copy` have been finalized,
      // so we can be sure that `scope.canAutoFreeze` is accurate.
      if (this.autoFreeze && scope.canAutoFreeze) {
        Object.freeze(state.copy);
      }
    }
    return state.copy;
  }
  /**
   * @internal
   * Finalize all drafts in the given state tree.
   */
  finalizeTree(root, rootPath, scope) {
    // debugger;
    const state = root[DRAFT_STATE];
    if (state) {
      if (!this.useProxies) {
        state.finalizing = true;
        state.copy = shallowCopy(state.draft, true);
        state.finalizing = false;
      }
      // eslint-disable-next-line no-param-reassign
      root = state.copy;
    }

    const needPatches = !!rootPath && !!scope.patches;
    const finalizeProperty = (prop, value, parent) => {
      // debugger;
      if (value === parent) {
        throw Error('Immer forbids circular references');
      }

      // In the `finalizeTree` method, only the `root` object may be a draft.
      const isDraftProp = !!state && parent === root;

      if (isDraft(value)) {
        const path =
          isDraftProp && needPatches && !state.assigned[prop]
            ? rootPath.concat(prop)
            : null;

        // Drafts owned by `scope` are finalized here.
        // eslint-disable-next-line no-param-reassign
        value = this.finalize(value, path, scope);

        // Drafts from another scope must prevent auto-freezing.
        if (isDraft(value)) {
          scope.canAutoFreeze = false;
        }

        // Preserve non-enumerable properties.
        if (Array.isArray(parent) || isEnumerable(parent, prop)) {
          parent[prop] = value;
        } else {
          Object.defineProperty(parent, prop, { value });
        }

        // Unchanged drafts are never passed to the `onAssign` hook.
        if (isDraftProp && value === state.base[prop]) return;
      }
      // Unchanged draft properties are ignored.
      else if (isDraftProp && is(value, state.base[prop])) {
        return;
      }
      // Search new objects for unfinalized drafts. Frozen objects should never contain drafts.
      else if (isDraftable(value) && !Object.isFrozen(value)) {
        each(value, finalizeProperty);
      }

      if (isDraftProp && this.onAssign) {
        this.onAssign(state, prop, value);
      }
    };

    each(root, finalizeProperty);
    return root;
  }
}
