import { useSyncExternalStore, useMemo } from "react";
import {
  ExcludeFunction,
  StateCreator,
  StoreApi,
  createStore,
} from "./vanilla";

type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

type ReadonlyStoreApi<T extends ExcludeFunction> = Pick<
  StoreApi<T>,
  "getState" | "subscribe"
>;

type WithReact<S extends ReadonlyStoreApi<ExcludeFunction>> = S & {
  getServerState?: () => ExtractState<S>;
};

export const create = <T extends ExcludeFunction>(
  creactState: StateCreator<T>
) => createImpl(creactState);

const createImpl = <T extends ExcludeFunction>(
  creactState: StateCreator<T>
) => {
  const api = createStore(creactState);

  function useBoundStore<R extends (state: T) => any>(
    selector: R,
    isEqual?: (currentState: T, nextState: T) => boolean
  ): ReturnType<R>;
  function useBoundStore<R extends (state: T) => any>(
    selector: R,
    isEqual?: (
      currentSelection: ReturnType<R>,
      nextSelection: ReturnType<R>
    ) => boolean
  ): ReturnType<R>;
  function useBoundStore(): T;
  function useBoundStore<R extends (state: T) => any>(
    selector?: R,
    isEqual?: (
      currentState: T | ReturnType<R>,
      nextState: T | ReturnType<R>
    ) => boolean
  ) {
    return useStore<T, R>(api, selector, isEqual);
  }

  return useBoundStore;
};

const useStore = <T extends ExcludeFunction, R extends (state: T) => any>(
  api: WithReact<StoreApi<T>>,
  selector?: R,
  isEqual?: (
    currentState: T | ReturnType<R>,
    nextState: T | ReturnType<R>
  ) => boolean
) => {
  const getSelection = useMemo(() => {
    if (!selector) {
      return api.getState;
    }
    let hasMemo = false;
    let memoizedSnapshot: T;
    let memoizedSelection: ReturnType<R>;

    return () => {
      const nextSnapShot = api.getState();
      if (!hasMemo) {
        hasMemo = true;
        memoizedSnapshot = nextSnapShot;

        memoizedSelection = selector(nextSnapShot);

        return memoizedSelection;
      }

      const prevSnapshot = memoizedSnapshot;

      if (isEqual && isEqual(prevSnapshot, nextSnapShot)) {
        return prevSnapshot;
      }

      if (Object.is(prevSnapshot, nextSnapShot)) {
        return prevSnapshot;
      }

      memoizedSnapshot = nextSnapShot;

      const nextSelection = selector(nextSnapShot);

      const prevSelection = memoizedSelection;

      if (isEqual && isEqual(prevSelection, nextSelection)) {
        return prevSelection;
      }

      memoizedSelection = nextSelection;

      return memoizedSelection;
    };
  }, []);
  return useSyncExternalStore(api.subscribe, getSelection);
};
