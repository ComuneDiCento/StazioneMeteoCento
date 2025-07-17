import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Row, Col, Card, CardHeader, CardTitle, CardBody } from 'design-react-kit';
import { toRomeDate } from '../../utils/dataUtils';

const WIND_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const getWindDir = deg => WIND_DIRECTIONS[Math.floor(((deg || 0) % 360) / 45)];

const getExtreme = (dataset, type) => {
  const finiteVals = dataset.data
    .map(d => ({ val: parseFloat(d.value), ts: d.timestamp || d.timedate }))
    .filter(d => Number.isFinite(d.val));

  if (!finiteVals.length) return null;

  const extremeObj = finiteVals.reduce((extreme, current) =>
    (type === 'min' ? current.val < extreme.val : current.val > extreme.val) ? current : extreme
  );

  return { value: extremeObj.val, time: extremeObj.ts };
};

const WindCard = ({ param, data, fmtTime, lastUpd }) => {
  const [plotKey, setPlotKey] = useState(0);

  useEffect(() => {
    const handleResize = () => setPlotKey(k => k + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hist = data || [];
  const entryMedia = hist.find(h => h.measure.key === 'VELOCITA MEDIA VENTO');
  const entryMax = hist.find(h => h.measure.key === 'VELOCITA MAX VENTO');
  const entryMin = hist.find(h => h.measure.key === 'VELOCITA MIN VENTO');
  const entryDir = hist.find(h => h.measure.key === 'DIREZIONE_VENTO');
  const entryRaf = hist.find(h => h.measure.key === 'DIREZIONE RAFFICA');

  const medLast = entryMedia?.data.at(-1);
  const maxExtreme = entryMax ? getExtreme(entryMax, 'max') : null;
  const minExtreme = entryMin ? getExtreme(entryMin, 'min') : null;
  const dirLast = entryDir?.data.at(-1);
  const rafLast = entryRaf?.data.at(-1);

  const items = [
    medLast && { label: 'Più recente', formatted: `${parseFloat(medLast.value).toFixed(1)} ${entryMedia.measure.descrizione_unita_misura}`, time: medLast.timestamp || medLast.timedate },
    maxExtreme && { label: 'Massima (periodo)', formatted: `${maxExtreme.value.toFixed(1)} ${entryMax.measure.descrizione_unita_misura}`, time: maxExtreme.time },
    minExtreme && { label: 'Minima (periodo)', formatted: `${minExtreme.value.toFixed(1)} ${entryMin.measure.descrizione_unita_misura}`, time: minExtreme.time },
    dirLast && { label: 'Direzione', formatted: getWindDir(parseFloat(dirLast.value)), time: dirLast.timestamp || dirLast.timedate },
    rafLast && { label: 'Direzione raffica', formatted: getWindDir(parseFloat(rafLast.value)), time: rafLast.timestamp || rafLast.timedate }
  ].filter(Boolean);

  const buildTrace = (entry, label, color) => entry ? {
    x: entry.data.map(d => new Date(d.timestamp || d.timedate)),
    y: entry.data.map(d => parseFloat(d.value)),
    type: 'scatter',
    mode: 'lines',
    name: label,
    line: { width: 2, color }
  } : null;

  const plotVelocity = [buildTrace(entryMedia, 'Media', '#2196F3'), buildTrace(entryMax, 'Max', '#f44336'), buildTrace(entryMin, 'Min', '#4caf50')].filter(Boolean);
  const plotDirection = [buildTrace(entryDir, 'Direzione', '#FFC107')].filter(Boolean);

  const direction = (entryRaf?.data ?? []).map(d => parseFloat(d.value));
  const speed = (entryMax?.data ?? []).map(d => parseFloat(d.value));

  const windRoseData = (() => {
    const speedRanges = [
      { min: 0.0, max: 0.2, color: '#00e676', label: 'Bf 0' },
      { min: 0.3, max: 1.5, color: '#66eb6e', label: 'Bf 1' },
      { min: 1.6, max: 3.3, color: '#c6ea4b', label: 'Bf 2' },
      { min: 3.4, max: 5.4, color: '#fdd835', label: 'Bf 3' },
      { min: 5.5, max: 7.9, color: '#ffc107', label: 'Bf 4' },
      { min: 8.0, max: 10.7, color: '#ff9800', label: 'Bf 5' },
      { min: 10.8, max: 13.8, color: '#ff7043', label: 'Bf 6' },
      { min: 13.9, max: 17.1, color: '#ff5722', label: 'Bf 7' },
      { min: 17.2, max: 20.7, color: '#f44336', label: 'Bf 8' },
      { min: 20.8, max: 24.4, color: '#e53935', label: 'Bf 9' },
      { min: 24.5, max: 28.4, color: '#d32f2f', label: 'Bf 10' },
      { min: 28.5, max: 32.6, color: '#c62828', label: 'Bf 11' },
      { min: 32.7, max: Infinity, color: '#b71c1c', label: 'Bf 12' }
    ];

    const counts = speedRanges.map(() => Array(8).fill(0));
    for (let i = 0; i < direction.length; i++) {
      const dir = direction[i];
      const spd = speed[i];
      const sector = Math.floor(((dir || 0) % 360) / 45);
      const rangeIdx = speedRanges.findIndex(r => spd >= r.min && spd < r.max);
      if (rangeIdx !== -1) counts[rangeIdx][sector]++;
    }

    return speedRanges.map((range, i) => ({
      type: 'barpolar',
      r: counts[i],
      theta: Array.from({ length: 8 }, (_, j) => j * 45),
      name: range.label,
      marker: { color: range.color }
    }));
  })();

  return (
    <Card
      className="card-bg"
      spacing
    >
      <CardHeader>
        <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ color: param.color }}>{param.icon}</div>
          <h4 className="card-title mb-0" style={{ marginLeft: '8px' }}>{param.label}</h4>
        </CardTitle>

        <Row className="mb-3">
          {items.map((d, i) => (
            <Col key={i} sm={6} className="mb-3">
              <h5>{d.formatted}</h5>
              <small className="text-secondary d-block">{d.label}</small>
              <small className="text-muted d-block">
                {(toRomeDate(d.time) || lastUpd)?.toLocaleString('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </small>
            </Col>
          ))}
        </Row>
      </CardHeader>
      <CardBody>

        <Row>
          {plotVelocity.length > 0 && (
            <Plot key={`${plotKey}-velocity`} data={plotVelocity} layout={{ height: 250, margin: { t: 30, r: 10, b: 40, l: 40 }, 
            xaxis: { title: 'Orario', type: 'date', tickformat: '%d/%m<br>%H:%M', fixedrange: true }, 
            yaxis: { title: entryMedia?.measure?.descrizione_unita_misura || 'm/s', autorange: true, fixedrange: true }, 
            legend: { orientation: 'h', x: 0.5, y: -0.3, xanchor: 'center', yanchor: 'top' } }}
              config={{ displayModeBar: false, responsive: true, scrollZoom: false, doubleClick: false, displaylogo: false, modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d'] }}
              style={{ width: '100%' }} />
          )}

          <Plot key={`${plotKey}-rose`} data={windRoseData} layout={{ title: { text: 'Rosa dei venti (raffiche)', font: { size: 16 } }, polar: { angularaxis: { rotation: 90, direction: 'clockwise', tickmode: 'array', tickvals: [0, 45, 90, 135, 180, 225, 270, 315], ticktext: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'], fixedrange: true }, 
          radialaxis: { ticksuffix: '%', angle: 90, showline: false, fixedrange: true } },   dragmode: false, 
           showlegend: true, legend: { orientation: 'v', x: 0.95, y: 0.5 }, margin: { t: 60, b: 20, l: 20, r: 150 }, height: 400 }} 
                                config={{ displayModeBar: false, responsive: true, scrollZoom: false, doubleClick: false, displaylogo: false, modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d'] }}
          style={{ width: '100%' }} />
        </Row>

      </CardBody>
    </Card>
  );
};

export default WindCard;
