import FSM from '../index';

describe('FSM', () => {
  enum SE {
    preNo, no,
    preGood, good,
    preBad, bad,
  }
  enum EE {
    good, bad, done,
    fail,
  }
  const m = new FSM<SE, EE>();
  m.In(SE.no)
    .On(EE.good, SE.preGood)
    .On(EE.bad, SE.preBad);
  m.In(SE.good).On(EE.good, SE.preNo);
  m.In(SE.bad).On(EE.bad, SE.preNo);
  m.In(SE.preGood).On(EE.done, SE.good);
  m.In(SE.preBad).On(EE.done, SE.bad);
  m.In(SE.preNo).On(EE.done, SE.no);
  const rules = m.toString();

  it('good & bad', () => {
    const x = m.Init(SE.no);
    expect(x.getState()).toBe(SE.no);
    x.Do(EE.good);
    expect(x.getState()).toBe(SE.preGood);
    x.Do(EE.good);
    expect(x.getState()).toBe(SE.preGood);
    x.Do(EE.done);
    expect(x.getState()).toBe(SE.good);
    x.Do(EE.bad);
    expect(x.getState()).toBe(SE.good);
    x.Do(EE.good);
    expect(x.getState()).toBe(SE.preNo);
    x.Do(EE.good);
    expect(x.getState()).toBe(SE.preNo);
    x.Do(EE.done);
    expect(x.getState()).toBe(SE.no);
  });

  it('good & bad 2 (with fail)', () => {
    const c = m.Clone();
    c.In(SE.preGood).Rollback(EE.fail);
    c.In(SE.preBad).Rollback(EE.fail);
    c.In(SE.preNo).Rollback(EE.fail);
    expect(m.toString()).toBe(rules);
    const x = c.Init(SE.good);
    x.Do(EE.fail);
    expect(x.getState()).toBe(SE.good);
    x.Do(EE.good);
    expect(x.getState()).toBe(SE.preNo);
    x.Do(EE.fail);
    expect(x.getState()).toBe(SE.good);
    x.Do(EE.good);
    expect(x.getState()).toBe(SE.preNo);
    x.Do(EE.done);
    expect(x.getState()).toBe(SE.no);
    x.Do(EE.good);
    expect(x.getState()).toBe(SE.preGood);
    x.Do(EE.fail);
    expect(x.getState()).toBe(SE.no);
  });

  it('good & bad 3-1', done => {
    const x = m.Init(SE.good);
    let status = SE.good;
    x.Watch(s => {
      expect(s).toBe(SE.preNo);
      done();
    });
    x.Do(EE.good);
  });

  it('good & bad 3-2', done => {
    const x = m.Init(SE.good);
    let status = SE.good;
    x.Watch(s => {
      if (s === SE.bad) {
        done();
      }
    });
    const shouldCancel = function () {
      expect('watching').toBe('shouldCancel');
    }
    const shouldCancel2 = function () {
      expect('watching').toBe('shouldCancel');
    }
    x.Watch(SE.bad, shouldCancel);
    x.Watch(shouldCancel2);
    x.Watch(SE.no, (s, his) => {
      expect(s).toBe(SE.no);
      expect(his).toStrictEqual([SE.good, SE.preNo])
    })
    x.Unwatch(SE.bad, shouldCancel);
    x.Unwatch(shouldCancel2);
    x.Do(EE.good);
    x.Do(EE.good);
    x.Do(EE.done);
    x.Do(EE.bad);
    x.Do(EE.done);
  });

  it('good & bad 4', () => {
    enum SE {
      preNo, no,
      preGood, good,
      preBad, bad,
    }
    enum EE {
      request, done
    }
    type T = 'good' | 'bad';
    const cancel = (pre: SE, type: T) => {
      if ((pre === SE.good && type === 'good')
        || (pre === SE.bad && type === 'bad')) {
        return SE.preNo;
      }
      return pre;
    }
    const done = (pre: SE) => {
      switch (pre) {
        case SE.preGood:
          return SE.good;
        case SE.preBad:
          return SE.bad;
        case SE.preNo:
          return SE.no;
        default:
          return pre;
      }
    }
    const m = new FSM<SE, EE>();
    m.In(SE.no).On(EE.request, (_: SE, type: T) =>
      type === 'good' ? SE.preGood : SE.preBad);
    m.In(SE.good).On(EE.request, cancel);
    m.In(SE.bad).On(EE.request, cancel);
    m.In(SE.preGood).On(EE.done, done);
    m.In(SE.preBad).On(EE.done, done);
    m.In(SE.preNo).On(EE.done, done);
    const x = m.Init(SE.no)
    expect(x.getState()).toBe(SE.no);
    x.Do<T[]>(EE.request, 'good');
    expect(x.getState()).toBe(SE.preGood);
    x.Do<T[]>(EE.request, 'good');
    expect(x.getState()).toBe(SE.preGood);
    x.Do(EE.done);
    expect(x.getState()).toBe(SE.good);
    x.Do<T[]>(EE.request, 'bad');
    expect(x.getState()).toBe(SE.good);
    x.Do<T[]>(EE.request, 'good');
    expect(x.getState()).toBe(SE.preNo);
    x.Do<T[]>(EE.request, 'good');
    expect(x.getState()).toBe(SE.preNo);
    x.Do(EE.done);
    expect(x.getState()).toBe(SE.no);
  });
});
