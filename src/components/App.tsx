import { useRef, useState } from "react";
import { useHotkeys } from "../hooks/hotkeysHook/";
import "./App.css";

function App() {
  const [pressedKeys, setPressedKeys] = useState<number>(0);
  const ref = useRef(null);
  const ref_b = useRef(null);
  const [on, setOn] = useState<boolean>(false);
  const onClick = () => {
    if (ref && document.activeElement === ref.current) {
      setOn(true);
    } else {
      setOn(false);
    }
  };

  const keyActionMap1: Record<string, Function> = {
    "shift+a": () => {
      setPressedKeys((num) => num + 1);
    },
  };
  const keyActionMap2: Record<string, Function> = {
    "shift+a": () => {
      setPressedKeys((num) => num - 1);
    },
  };

  useHotkeys(
    "shift+a",
    () => {
      setPressedKeys((num) => num + 1);
    },
    ref
  );
  useHotkeys(
    "shift",
    () => {
      setPressedKeys((num) => num + 1);
    },
    ref,
    { keyup: true }
  );
  return (
    <div onClick={onClick} className="App">
      <header className="App-header">
        <p>Your pressed shift+a {pressedKeys} times</p>
        <button
          onClick={onClick}
          style={{
            width: "50px",
            height: "30px",
            backgroundColor: on ? "white" : "gray",
            margin: "10px",
          }}
          ref={ref}
        >
          On
        </button>
        <button
          onClick={onClick}
          style={{
            width: "50px",
            height: "30px",
            backgroundColor: on ? "gray" : "white",
            margin: "10px",
          }}
          ref={ref_b}
        >
          Off
        </button>
      </header>
    </div>
  );
}

export default App;
