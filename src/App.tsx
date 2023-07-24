import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { create } from "./zustand";

interface BearState {
  bears: number;
  increase: (by?: number) => void;
  decrease: (by?: number) => void;
  reset: () => void;
}

const useBearState = create<BearState>((set) => ({
  bears: 0,
  increase: (by = 1) => set((state) => ({ bears: state.bears + by })),
  decrease: (by = 1) => set((state) => ({ bears: state.bears - by })),
  reset: () => set({ bears: 0 }),
}));

function App() {
  const { bears, increase, decrease, reset } = useBearState();

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => increase()}>increase</button>
        <button onClick={() => decrease()}>decrease</button>
        <button onClick={() => reset()}>reset</button>
        <p>count is {bears}</p>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
