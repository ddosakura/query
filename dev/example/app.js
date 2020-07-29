(({ status, btnGood, btnBad }, { FSM }) => {
  // enum SE {
  //   preNo, no,
  //   preGood, good,
  //   preBad, bad,
  // }
  // enum EE {
  //   good, bad, done,
  //   fail,
  // }
  const SE = {
    preNo: 0,
    no: 1,
    preGood: 2,
    good: 3,
    preBad: 4,
    bad: 5,
  }
  const EE = {
    good: 0,
    bad: 1,
    done: 2,
    fail: 3,
  }

  let store;

  const appFSM = new FSM();
  appFSM.In(SE.no).On(EE.good, () => {
    setTimeout(() => store.Do(EE.done), 1000);
    return SE.preGood;
  })
    .On(EE.bad, () => {
      setTimeout(() => store.Do(EE.done), 1000);
      return SE.preBad;
    });
  appFSM.In(SE.good).On(EE.good, () => {
    setTimeout(() => store.Do(EE.done), 1000);
    return SE.preNo;
  })
  appFSM.In(SE.bad).On(EE.bad, () => {
    setTimeout(() => store.Do(EE.done), 1000);
    return SE.preNo;
  })
  appFSM.In(SE.preGood).On(EE.done, () => {
    status.innerText = 'good';
    return SE.good;
  });
  appFSM.In(SE.preBad).On(EE.done, () => {
    status.innerText = 'bad';
    return SE.bad;
  });
  appFSM.In(SE.preNo).On(EE.done, () => {
    status.innerText = 'no';
    return SE.no;
  });

  store = appFSM.Init(SE.no);
  status.innerText = 'no';

  btnGood.onclick = () => {
    store.Do(EE.good);
  };
  btnBad.onclick = () => {
    store.Do(EE.bad);
  };
})({
  status: document.getElementById('app-status'),
  btnGood: document.getElementById('app-btn-good'),
  btnBad: document.getElementById('app-btn-bad'),
}, Query);
