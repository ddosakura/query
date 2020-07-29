(({ status, btnGood, btnBad }, { FSM }) => {
  // 定义有限自动机
  const STATE = {
    preNo: 0,
    no: 1,
    preGood: 2,
    good: 3,
    preBad: 4,
    bad: 5,
  }
  const EVENT = {
    good: 0,
    bad: 1,
    done: 2,
    fail: 3,
  }
  const m = new FSM();
  m.In(STATE.no)
    .On(EVENT.good, STATE.preGood)
    .On(EVENT.bad, STATE.preBad);
  m.In(STATE.good).On(EVENT.good, STATE.preNo);
  m.In(STATE.bad).On(EVENT.bad, STATE.preNo);
  m.In(STATE.preGood).On(EVENT.done, STATE.good).Rollback(EVENT.fail);
  m.In(STATE.preBad).On(EVENT.done, STATE.bad).Rollback(EVENT.fail);
  m.In(STATE.preNo).On(EVENT.done, STATE.no).Rollback(EVENT.fail);

  // 自动机实例化 & 数据绑定
  const store = m.Init(STATE.no);
  status.innerText = 'no';
  store.Watch(STATE.good, () => status.innerText = 'good');
  store.Watch(STATE.bad, () => status.innerText = 'bad');
  store.Watch(STATE.no, () => status.innerText = 'no');

  // 事件绑定
  btnGood.onclick = () => {
    store.Do(EVENT.good);
  };
  btnBad.onclick = () => {
    store.Do(EVENT.bad);
  };

  // 模拟网络请求
  const fn = () => {
    if (Math.random() < 0.3) {
      store.Do(EVENT.fail);
      alert('fail');
      return;
    }
    setTimeout(() => store.Do(EVENT.done), 1000)
  }
  store.Watch(STATE.preGood, fn);
  store.Watch(STATE.preBad, fn);
  store.Watch(STATE.preNo, fn);
})({
  status: document.getElementById('app2-status'),
  btnGood: document.getElementById('app2-btn-good'),
  btnBad: document.getElementById('app2-btn-bad'),
}, Query);
