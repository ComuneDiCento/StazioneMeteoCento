import React, { useState, useRef } from "react";
import { Tabs, Tab, Box } from '@mui/material';
import WeatherDashboard from './WeatherDashboard';

function App() {
  const [activeTab, setActiveTab] = useState(0); // Track active tab using index
  const trafficDashboardRef = useRef(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1 && trafficDashboardRef.current) {
      // Trigger invalidateSize when the TrafficDashboard tab is activated
      trafficDashboardRef.current.invalidateMapSize();
    }
  };

  return (
    <div className="App">
      <Box>
        <div style={{ display: activeTab === 0 ? 'block' : 'none' }}>
          <WeatherDashboard pollingInterval={300000} />
        </div>
      </Box>
    </div>
  );
}

export default App;
