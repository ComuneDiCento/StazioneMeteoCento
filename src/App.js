import React from "react";
import WeatherDashboard from './WeatherDashboard';

function App() {
  return (
    <div className="App container my-4">
      <WeatherDashboard pollingInterval={300000} />
    </div>
  );
}

export default App;
