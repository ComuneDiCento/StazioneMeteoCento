import React from 'react';
import TemperatureCard from './TemperatureCard';
import WindCard from './WindCard';
import GenericWeatherCard from './GenericWeatherCard';
import RainCard from './RainCard';
import AirQualityCard from './AirQualityCard';

/**
 * Wrapper per scegliere dinamicamente quale card mostrare
 */
const WeatherCardWrapper = ({ param, data, formatChartData, fmtTime, lastUpd }) => {
  switch (param.label) {
    case 'Temperatura':
      return (
        <TemperatureCard
          param={param}
          data={data}
          lastUpd={lastUpd}
          fmtTime={fmtTime}
        />
      );

    case 'Vento':
      return (
        <WindCard
          param={param}
          data={data}
          lastUpd={lastUpd}
          fmtTime={fmtTime}
          formatChartData={formatChartData}
        />
      );

    case 'Pioggia':
      return (
        <RainCard
          param={param}
          data={data}
          lastUpd={lastUpd}
          fmtTime={fmtTime}
        />
      );

    case 'Qualità Aria ARPAE':
      return (
        <AirQualityCard
          param={param}
          data={data}
          lastUpd={lastUpd}
          fmtTime={fmtTime}
        />
      );

    default:
      return (
        <GenericWeatherCard
          param={param}
          data={data}
          lastUpd={lastUpd}
          fmtTime={fmtTime}
          formatChartData={formatChartData}
        />
      );
  }
};

export default WeatherCardWrapper;
