import FSM from "../fsm";

export enum action {
  Init = 'Init',
  Failed = 'Failed',
  MarkStale = 'MarkStale',
  MarkGC = 'MarkGC',
  Fetch = 'Fetch',
  Success = 'Success',
  Error = 'Error',
  SetState = 'SetState',
}

const fsm = new FSM<action>();

export default fsm;
