import { FC } from "react";
import { CompleteHeader } from "./components";
import WeatherDashboard from './WeatherDashboard';
import Footer from "./components/Footer";

import "./App.css";
import "bootstrap-italia/dist/css/bootstrap-italia.min.css";

export const App: FC = () => {
    return (
    <div className="App">
      <CompleteHeader />
      <div className="container my-4">
      <WeatherDashboard />
      <Footer />
      </div>
    </div>
  );
}

export default App;
