import React from 'react';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import Plot from 'react-plotly.js';
import { toRomeDate } from '../../utils/dataUtils';

const TemperatureCard = ({ param, data, lastUpd, fmtTime }) => {
  const baseTemp = data?.find(h => h.measure.key === 'TEMPERATURA');
  const maxTemp = data?.find(h => h.measure.key === 'MAX');
  const minTemp = data?.find(h => h.measure.key === 'MIN');

  let vals = [];

  // Media (Attuale)
  if (baseTemp?.data?.length) {
    const last = baseTemp.data[baseTemp.data.length - 1];
    vals.push({
      label: 'Media',
      value: parseFloat(last.value),
      unit: baseTemp.measure.descrizione_unita_misura,
      time: last.timestamp || last.timedate
    });
  }

  // Massima
  if (maxTemp?.data?.length) {
    const maxValues = maxTemp.data.map(d => parseFloat(d.value)).filter(v => !isNaN(v));
    const max = Math.max(...maxValues);
    const index = maxValues.indexOf(max);
    const time = maxTemp.data[index]?.timestamp || maxTemp.data[index]?.timedate;
    vals.push({
      label: 'Massima',
      value: max,
      unit: maxTemp.measure.descrizione_unita_misura,
      time
    });
  }

  // Minima
  if (minTemp?.data?.length) {
    const minValues = minTemp.data.map(d => parseFloat(d.value)).filter(v => !isNaN(v));
    const min = Math.min(...minValues);
    const index = minValues.indexOf(min);
    const time = minTemp.data[index]?.timestamp || minTemp.data[index]?.timedate;
    vals.push({
      label: 'Minima',
      value: min,
      unit: minTemp.measure.descrizione_unita_misura,
      time
    });
  }

  // Format per il grafico
  const formatPlotlyData = (dataset, label, color) => {
    if (!dataset) return null;
    const timestamps = dataset.data.map(d => new Date(d.timestamp || d.timedate));
    const values = dataset.data.map(d => parseFloat(d.value));
    return {
      x: timestamps,
      y: values,
      type: 'scatter',
      mode: 'lines',
      name: label,
      line: { width: 2, color }
    };
  };

  const traces = [
    formatPlotlyData(baseTemp, 'Media', '#1976d2'),
    formatPlotlyData(maxTemp, 'Massima', '#d32f2f'),
    formatPlotlyData(minTemp, 'Minima', '#388e3c')
  ].filter(Boolean);

  return (
    <div className="card shadow-sm hover-shadow mb-4">
      <div className="card-body">
        {/* Header icona + label */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <div style={{ color: param.color }}>
            <ThermostatIcon />
          </div>
          <h5 className="card-title mb-0">{param.label}</h5>
        </div>

        {/* Valori temperatura */}
        <div className="row mb-3">
          {vals.map((d, i) => (
            <div className="col-sm-4 mb-3" key={i}>
              <h5>{d.value.toFixed(1)} {d.unit}</h5>
              <small className="text-secondary d-block">{d.label}</small>
              <small className="text-muted d-block">
                {(toRomeDate(d.time) || lastUpd)?.toLocaleString('it-IT', {
                  timeZone: 'Europe/Rome',
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </small>
            </div>
          ))}
        </div>

        {/* Grafico */}
        {traces.length > 0 && (
          <Plot
            data={traces}
            layout={{
              height: 250,
              margin: { t: 10, r: 10, b: 40, l: 40 },
              xaxis: {
                title: 'Orario',
                tickformat: '%d/%m, %H:%M',
                type: 'date'
              },
              yaxis: {
                title: baseTemp?.measure?.descrizione_unita_misura || '°C',
                autorange: true
              },
              legend: { orientation: 'h' }
            }}
            config={{ displayModeBar: false, responsive: true, staticPlot: true }}
            style={{ width: '100%' }}
          />
        )}
      </div>
    </div>
  );
};

export default TemperatureCard;
