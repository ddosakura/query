type Token = string | number;

type Handler<S extends Token, A extends any[] = any[]> = S | ((pre: S, ...args: A) => S); // Promise<S> ?

type Rule<S extends Token> = {
  [e0: string]: Handler<S>
  [e1: number]: Handler<S>
}
type Rules<S extends Token> = {
  [s0: string]: Rule<S>
  [s1: number]: Rule<S>
}
type Watcher<S extends Token> = (s: S, history: S[]) => void;
type WatcherList<S extends Token> = {
  [e0: string]: Watcher<S>[]
  [e1: number]: Watcher<S>[]
}

interface Transfer<S extends Token, E extends Token> {
  On: (e: E, h: Handler<S>) => Transfer<S, E>
  Rollback: (e: E) => Transfer<S, E>
}

export const FSM_Rollback: string = true as unknown as string;
const FSM_ALL_WATCHER = true as unknown as string;

class SM<S extends Token = string, E extends Token = string> {
  private rules: Rules<S>;
  private state: S;
  private lock = false;
  private history: S[] = [];
  private watchers: WatcherList<S> = {};

  constructor(rules: Rules<S>, s: S) {
    this.rules = rules;
    this.state = s;
  }

  public Do<A extends any[] = any[]>(e: E, ...args: A) {
    if (this.lock) {
      return this; // TODO: 是否可被优化掉
    }
    this.lock = true;
    const s = this.state;
    const r: Rule<S> = this.rules[s] ?? {};
    const h: (Handler<S, A> | undefined) = r[e];
    if (h === FSM_Rollback) {
      this.state = this.history.pop() ?? this.state;
    } else if (h !== undefined) {
      this.state = typeof h === 'function' ? h(s, ...args) : h;
      if (this.state !== s) {
        this.history.push(s);
      }
    }
    const state = this.state;
    const history = [...this.history];
    this.lock = false;
    if (state !== s) {
      this.watchers[FSM_ALL_WATCHER]?.forEach(h =>
        setImmediate(() => h(state, history)));
      this.watchers[state]?.forEach(h =>
        setImmediate(() => h(state, history)));
    }
    return this;
  }

  public getState() {
    return this.state;
  }

  public Watch(h: Watcher<S>): void;
  public Watch(s: S, h: Watcher<S>): void;
  public Watch(a0: S | Watcher<S>, a1?: Watcher<S>) {
    if (typeof a0 === 'function') {
      return this.watch(FSM_ALL_WATCHER as S, a0);
    }
    return a1 ? this.watch(a0, a1) : void 0;
  }

  public Unwatch(h: Watcher<S>): void;
  public Unwatch(s: S, h: Watcher<S>): void;
  public Unwatch(a0: S | Watcher<S>, a1?: Watcher<S>) {
    if (typeof a0 === 'function') {
      return this.unwatch(FSM_ALL_WATCHER as S, a0);
    }
    return a1 ? this.unwatch(a0, a1) : void 0;
  }

  private watch(s: S, h: Watcher<S>) {
    this.unwatch(s, h);
    this.watchers[s].push(h);
  }

  private unwatch(s: S, h: Watcher<S>) {
    this.watchers[s] = this.watchers[s]?.filter(w => w !== h) ?? [];
  }
}

export default class FSM<S extends Token = string, E extends Token = string> {
  private rules: Rules<S>;
  constructor(rules?: Rules<S> | string) {
    if (typeof rules === 'string') {
      this.rules = JSON.parse(rules);
      return;
    };
    this.rules = Object.assign({}, rules) ?? {};
  }

  public In(s: S): Transfer<S, E> {
    const fsm = this;
    return {
      On(e: E, h: Handler<S>) {
        const r: Rule<S> = fsm.rules[s] ?? {};
        r[e] = h;
        fsm.rules[s] = r;
        return this;
      },
      Rollback(e: E) {
        const r: Rule<S> = fsm.rules[s] ?? {};
        r[e] = FSM_Rollback as S;
        fsm.rules[s] = r;
        return this;
      }
    }
  }

  public valueOf() {
    return JSON.stringify(this.rules);
  }

  public toString() {
    return this.valueOf();
  }

  public Clone() {
    return new FSM<S, E>(this.valueOf());
  };

  public Init(s: S) {
    return new SM<S, E>(this.rules, s);
  }
}
