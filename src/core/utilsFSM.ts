import FSM from "../fsm";

export enum status {
  Idle = 'idle',
  Loading = 'loading',
  Error = 'error',
  Success = 'success',
};

const fsm = new FSM<status>();

export default fsm;
