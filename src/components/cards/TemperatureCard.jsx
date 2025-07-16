import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Row, Col, Card, CardHeader, CardTitle, CardBody } from 'design-react-kit';
import { toRomeDate } from '../../utils/dataUtils';

const TemperatureCard = ({ param, data, lastUpd, fmtTime }) => {
  const [plotKey, setPlotKey] = useState(0);

  // 🔧 Forza il remount del grafico quando la finestra viene ridimensionata
  useEffect(() => {
    const handleResize = () => setPlotKey(k => k + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const baseTemp = data?.find(h => h.measure.key === 'TEMPERATURA');
  const maxTemp = data?.find(h => h.measure.key === 'MAX');
  const minTemp = data?.find(h => h.measure.key === 'MIN');

  const vals = [];

  if (baseTemp?.data?.length) {
    const last = baseTemp.data[baseTemp.data.length - 1];
    vals.push({
      label: 'Più recente',
      value: parseFloat(last.value),
      unit: baseTemp.measure.descrizione_unita_misura,
      time: last.timestamp || last.timedate
    });
  }

  if (maxTemp?.data?.length) {
    const maxValues = maxTemp.data.map(d => parseFloat(d.value)).filter(Number.isFinite);
    const max = Math.max(...maxValues);
    const index = maxValues.indexOf(max);
    const time = maxTemp.data[index]?.timestamp || maxTemp.data[index]?.timedate;
    vals.push({
      label: 'Massima (periodo)',
      value: max,
      unit: maxTemp.measure.descrizione_unita_misura,
      time
    });
  }

  if (minTemp?.data?.length) {
    const minValues = minTemp.data.map(d => parseFloat(d.value)).filter(Number.isFinite);
    const min = Math.min(...minValues);
    const index = minValues.indexOf(min);
    const time = minTemp.data[index]?.timestamp || minTemp.data[index]?.timedate;
    vals.push({
      label: 'Minima (periodo)',
      value: min,
      unit: minTemp.measure.descrizione_unita_misura,
      time
    });
  }

  const formatPlotlyData = (dataset, label, color) => {
    if (!dataset) return null;
    return {
      x: dataset.data.map(d => new Date(d.timestamp || d.timedate)),
      y: dataset.data.map(d => parseFloat(d.value)),
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
    <Card
      className="card-bg"
      spacing
    ><CardHeader>
        <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ color: param.color }}>{param.icon}</div>
          <h4 className="card-title mb-0" style={{ marginLeft: '8px' }}>{param.label}</h4>
        </CardTitle>

        <Row className="mb-3">
          {vals.map((d, i) => (
            <Col sm={4} className="mb-3" key={i}>
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
            </Col>
          ))}
        </Row>
      </CardHeader>
      <CardBody>

        <Row>
          {traces.length > 0 && (
            <Plot
              key={plotKey} // 🔑 Rimonta il grafico al resize
              data={traces}
              layout={{
                height: 250,
                margin: { t: 10, r: 10, b: 30, l: 40 },
                xaxis: {
                  title: 'Orario',
                  tickformat: '%d/%m<br>%H:%M',
                  type: 'date'
                },
                yaxis: {
                  title: baseTemp?.measure?.descrizione_unita_misura || '°C',
                  autorange: true
                },
                legend: { orientation: 'h', x: 0.5, y: -0.3, xanchor: 'center', yanchor: 'top' }
              }}
              config={{ displayModeBar: false, responsive: true, staticPlot: true }}
              style={{ width: '100%' }}
            />
          )}
        </Row>
      </CardBody>
    </Card>
  );
};

export default TemperatureCard;
