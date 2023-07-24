type NonFunction =
  | string
  | number
  | boolean
  | object
  | symbol
  | null
  | undefined;

export type ExcludeFunction = Exclude<NonFunction, (...args: any[]) => any>;

export interface StoreApi<T extends ExcludeFunction> {
  setState: (
    partial: T | Partial<T> | { fn(state: T): T | Partial<T> }["fn"],
    replace?: boolean
  ) => void;
  getState: () => T;
  subscribe: (callback: (state: T, prevState: T) => void) => () => void;
  destory: () => void;
}

export type StateCreator<T extends ExcludeFunction> = (
  setState: StoreApi<T>["setState"],
  getState: StoreApi<T>["getState"]
) => T;

export const createStore = <TState extends ExcludeFunction>(
  createState: StateCreator<TState>
) => {
  type Listener = (state: TState, prevState: TState) => void;
  let state: TState;
  const listeners: Set<Listener> = new Set();

  const setState: StoreApi<TState>["setState"] = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;

    if (!Object.is(nextState, state)) {
      const previousState = state;
      state =
        replace ?? typeof nextState !== "object"
          ? nextState
          : Object.assign({}, state, nextState);

      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState: StoreApi<TState>["getState"] = () => state;
  const subscribe: StoreApi<TState>["subscribe"] = (listener: Listener) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
  };
  const destory: StoreApi<TState>["destory"] = () => {
    listeners.clear();
  };

  const api = {
    setState,
    getState,
    subscribe,
    destory,
  };

  state = createState(setState, getState);

  return api;
};
