import React from 'react';
import Plot from 'react-plotly.js';
import { Row, Col } from 'design-react-kit';
import { toRomeDate } from '../../utils/dataUtils';

const getExtreme = (entry, type) => {
  const nums = entry.data.map(d => parseFloat(d.value)).filter(Number.isFinite);
  if (!nums.length) return null;
  const ext = type === 'min' ? Math.min(...nums) : Math.max(...nums);
  const idx = entry.data.findIndex(d => parseFloat(d.value) === ext);
  const time = entry.data[idx]?.timestamp || entry.data[idx]?.timedate;
  return { value: ext, time };
};

const GenericWeatherCard = ({ param, data, fmtTime, lastUpd }) => {
  const hist = data || [];

  const values = param.keys.reduce((acc, k) => {
    const entry = hist.find(h => h.measure.key === k);
    if (!entry || !entry.data?.length) return acc;

    const unit = entry.measure.descrizione_unita_misura;
    const label = param.keyLabels?.[entry.measure.key] || entry.measure.key;
    const last = entry.data[entry.data.length - 1];

    const max = getExtreme(entry, 'max');
    const min = getExtreme(entry, 'min');

    acc.push({
      key: entry.measure.key,
      label,
      unit,
      current: { value: parseFloat(last.value), time: last.timestamp || last.timedate },
      max,
      min,
      data: entry.data,
    });

    return acc;
  }, []);

  const traces = values.map((v, i) => ({
    x: v.data.map(d => new Date(d.timestamp || d.timedate)),
    y: v.data.map(d => v.key === 'PIOGGIA CUMULATA' ? parseFloat(d.value) - parseFloat(v.data[0].value) : parseFloat(d.value)),
    type: 'scatter',
    mode: 'lines',
    name: v.label,
    line: { width: 2, color: param.chartColors?.[i] || param.color }
  }));

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div style={{ color: param.color }}>{param.icon}</div>
          <h5 className="card-title mb-0">{param.label}</h5>
        </div>

        <Row className="mb-3">
          {values.map((v, i) => (
            <React.Fragment key={i}>
              <Col sm={4} className="mb-3">
                <h5>{v.current.value.toFixed(1)} {v.unit}</h5>
                <small className="text-secondary d-block">{v.label}</small>
                <small className="text-muted">
                  {(toRomeDate(v.current.time) || lastUpd)?.toLocaleString('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </small>
              </Col>

              <Col sm={4} className="mb-3">
                <h5>{v.max?.value.toFixed(1)} {v.unit}</h5>
                <small className="text-secondary d-block">Massima</small>
                <small className="text-muted">
                  {(toRomeDate(v.max?.time) || lastUpd)?.toLocaleString('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </small>
              </Col>

              <Col sm={4} className="mb-3">
                <h5>{v.min?.value.toFixed(1)} {v.unit}</h5>
                <small className="text-secondary d-block">Minima</small>
                <small className="text-muted">
                  {(toRomeDate(v.min?.time) || lastUpd)?.toLocaleString('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </small>
              </Col>
            </React.Fragment>
          ))}
        </Row>

        {traces.length > 0 && (
          <Plot
            data={traces}
            layout={{
              height: 240,
              margin: { t: 10, r: 10, b: 40, l: 40 },
              xaxis: { title: 'Orario', tickformat: '%d/%m, %H:%M', type: 'date' },
              yaxis: { title: values[0]?.unit || '', autorange: true },
              legend: { orientation: 'h' },
            }}
            config={{ displayModeBar: false, responsive: true, staticPlot: true }}
            style={{ width: '100%' }}
          />
        )}
      </div>
    </div>
  );
};

export default GenericWeatherCard;
