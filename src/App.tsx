import { FC, useEffect } from "react";
import HeaderSticky from "bootstrap-italia/dist/plugins/header-sticky";
import { CompleteHeader } from "./components";
import WeatherDashboard from './WeatherDashboard';
import Footer from "./components/Footer";

import "./App.css";

export const App: FC = () => {
  useEffect(() => {
    const el = document.querySelector<HTMLDivElement>(
      ".it-header-wrapper.it-header-sticky"
    );
    if (el) {
      HeaderSticky.getOrCreateInstance(el);
    }
  }, []);

  return (
    <div className="App">
      <CompleteHeader />
      <div className="container my-4">
        <WeatherDashboard />
      </div>
      <Footer />
    </div>
  );
}

export default App;
