import React, { FC, useEffect, useRef, useState } from "react";
import { CompleteHeader } from "./components";
import WeatherDashboard from './WeatherDashboard';
import Footer from "./components/Footer";

import "./App.css";

export const App: FC = () => {
  const [historyHours, setHistoryHours] = useState<number>(48);
  const [intervalMs, setIntervalMs] = useState<number>(300000); // default 5m

  return (
    <div className="App">
      <div className="it-header-wrapper it-header-sticky">
        <CompleteHeader historyHours={historyHours} />
      </div>

      <div className="container my-4">
        <WeatherDashboard
          historyHours={historyHours}
          setHistoryHours={setHistoryHours}
          intervalMs={intervalMs}
          setIntervalMs={setIntervalMs}
        />
      </div>

      <Footer />
    </div>
  );
};

export default App;
