import { useSyncExternalStore } from "react";
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

  const useBoundStore = () => useStore(api);

  return useBoundStore;
};

const useStore = <T extends ExcludeFunction>(api: WithReact<StoreApi<T>>) => {
  return useSyncExternalStore(api.subscribe, api.getState);
};
