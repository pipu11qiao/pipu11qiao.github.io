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

    this.canAutoFreeze = true;
  }
  revoke() {
    this.leave();
    this.drafts.forEach(this.revoke);
    this.drafts = null;
  }
  leave() {
    if (this === ImmerScope.current) {
      ImmerScope.current = this.parent;
    }
  }
}
ImmerScope.current = null;
ImmerScope.enter = function () {
  this.current = new ImmerScope(this.current);
  return this.current;
};
