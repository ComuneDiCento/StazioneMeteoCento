import React from 'react';
import Plot from 'react-plotly.js';
import { Row, Col } from 'design-react-kit';
import { toRomeDate } from '../../utils/dataUtils';

const RainCard = ({ param, data, lastUpd }) => {
  const hist = data || [];

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
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div style={{ color: param.color }}>{param.icon}</div>
          <h5 className="card-title mb-0">{param.label}</h5>
        </div>

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

        <Row>{traces.length > 0 && (
          <Plot
            data={traces}
            layout={{
              height: 240,
              margin: { t: 10, r: 10, b: 60, l: 40 },
              xaxis: {
                title: 'Orario',
                type: 'date',
                tickformat: '%d/%m<br>%H:%M',
                automargin: true
              },
              yaxis: {
                title: values[0]?.unit || 'mm',
                autorange: true,
                rangemode: 'tozero'
              },
              legend: {
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.3
              }
            }}
            config={{ displayModeBar: false, responsive: true, staticPlot: true }}
            style={{ width: '100%' }}
          />
        )}
        </Row>
      </div>
    </div>
  );
};

export default RainCard;
