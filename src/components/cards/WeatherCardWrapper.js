import React from 'react';
import TemperatureCard from './TemperatureCard';
import WindCard from './WindCard';
import GenericWeatherCard from './GenericWeatherCard';
import RainCard from './RainCard';

const WeatherCardWrapper = ({ param, data, formatChartData, fmtTime, lastUpd }) => {
  if (param.label === 'Temperatura') {
    return <TemperatureCard param={param} data={data} lastUpd={lastUpd} fmtTime={fmtTime} />;
  }

  if (param.label === 'Vento') {
    return <WindCard param={param} data={data} lastUpd={lastUpd} fmtTime={fmtTime} formatChartData={formatChartData} />;
  }

  if (param.label === 'Pioggia') {
    return <RainCard param={param} data={data} lastUpd={lastUpd} fmtTime={fmtTime} />;
  }

  return <GenericWeatherCard param={param} data={data} lastUpd={lastUpd} fmtTime={fmtTime} formatChartData={formatChartData} />;
};

export default WeatherCardWrapper;
