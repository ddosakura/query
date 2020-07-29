let uidCount = 0;
export const uid = () => uidCount++;
// export const cancelledError = {}
// export let globalStateListeners = []
export const isServer = typeof window === 'undefined'
export function noop() { }
interface QueryConsole {
  error: (msg: string) => void
  warn: (msg: string) => void
  log: (msg: string) => void
}
// export function identity(d) {
//   return d
// }
export let Console: QueryConsole = console
  ?? ({ error: noop, warn: noop, log: noop } as unknown as QueryConsole)
export function setConsole(c: QueryConsole) {
  Console = c
}
