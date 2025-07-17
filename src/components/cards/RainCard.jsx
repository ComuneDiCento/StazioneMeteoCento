import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Card, CardHeader, CardTitle, CardBody, Row, Col } from 'design-react-kit';
import { toRomeDate } from '../../utils/dataUtils';

const RainCard = ({ param, data, lastUpd }) => {
  const hist = data || [];
  const [plotKey, setPlotKey] = useState(0);

  // 🔧 Aggiorna plotKey al resize per forzare il re-render del grafico
  useEffect(() => {
    const handleResize = () => setPlotKey(k => k + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cumulata = hist.find(h => h.measure.key === 'PIOGGIA CUMULATA');
  const incrementale = hist.find(h => h.measure.key === 'PIOGGIA INCREMENTALE');

  const values = [];

  if (cumulata?.data?.length >= 2) {
    const first = parseFloat(cumulata.data[0].value);
    const last = parseFloat(cumulata.data[cumulata.data.length - 1].value);
    const time = cumulata.data[cumulata.data.length - 1].timestamp || cumulata.data[cumulata.data.length - 1].timedate;

    values.push({
      label: param.keyLabels['PIOGGIA CUMULATA'],
      value: last - first,
      unit: cumulata.measure.descrizione_unita_misura,
      time
    });
  }

  if (incrementale?.data?.length) {
    const lastData = incrementale.data[incrementale.data.length - 1];
    values.push({
      label: param.keyLabels['PIOGGIA INCREMENTALE'],
      value: parseFloat(lastData.value),
      unit: incrementale.measure.descrizione_unita_misura,
      time: lastData.timestamp || lastData.timedate
    });
  }

  const traces = [];

  if (cumulata) {
    traces.push({
      x: cumulata.data.map(d => new Date(d.timestamp || d.timedate)),
      y: cumulata.data.map(d => parseFloat(d.value) - parseFloat(cumulata.data[0].value)),
      type: 'scatter',
      mode: 'lines',
      name: param.keyLabels['PIOGGIA CUMULATA'],
      line: { width: 2, color: param.chartColors?.[0] || param.color }
    });
  }

  if (incrementale) {
    traces.push({
      x: incrementale.data.map(d => new Date(d.timestamp || d.timedate)),
      y: incrementale.data.map(d => parseFloat(d.value)),
      type: 'scatter',
      mode: 'lines',
      name: param.keyLabels['PIOGGIA INCREMENTALE'],
      line: { width: 2, color: param.chartColors?.[1] || param.color }
    });
  }

  return (
    <Card
      className="card-bg"
      spacing>
      <CardHeader>
        <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ color: param.color }}>{param.icon}</div>
          <h4 className="card-title mb-0" style={{ marginLeft: '8px' }}>{param.label}</h4>
        </CardTitle>
        <Row className="mb-3">
          {values.map((d, i) => (
            <Col sm={6} className="mb-3" key={i}>
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
              key={plotKey} // 🔑 forza il remount al resize
              data={traces}
              layout={{
                height: 240,
                margin: { t: 10, r: 10, b: 60, l: 40 },
                xaxis: {
                  title: 'Orario',
                  type: 'date',
                  tickformat: '%d/%m<br>%H:%M',
                  automargin: true,
                  fixedrange: true
                },
                yaxis: {
                  title: values[0]?.unit || 'mm',
                  autorange: true,
                  rangemode: 'tozero',
                  fixedrange: true
                },
                legend: {
                  orientation: 'h',
                  x: 0.5,
                  xanchor: 'center',
                  y: -0.3
                }
              }}
              config={{ displayModeBar: false, responsive: true, scrollZoom: false, doubleClick: false, displaylogo: false, modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d'] }}
              style={{ width: '100%' }}
            />
          )}
        </Row>
      </CardBody>
    </Card>
  );
};

export default RainCard;
