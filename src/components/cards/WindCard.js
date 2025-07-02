import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import Plot from 'react-plotly.js';
import { toRomeDate } from '../../utils/dataUtils';

const WIND_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const getWindDir = deg => WIND_DIRECTIONS[Math.floor(((deg || 0) % 360) / 45)];

const getExtreme = (dataset, type) => {
  const finiteVals = dataset.data.reduce((acc, d) => {
    const val = parseFloat(d.value);
    return isFinite(val) ? acc.concat({ val, ts: d.timestamp || d.timedate }) : acc;
  }, []);
  if (!finiteVals.length) return null;

  const extremeObj = finiteVals.reduce((extreme, current) => {
    return (type === 'min' ? current.val < extreme.val : current.val > extreme.val) ? current : extreme;
  });

  return { value: extremeObj.val, time: extremeObj.ts };
};

const WindCard = ({ param, data, fmtTime, lastUpd }) => {
  const hist = data || [];

  const entryMedia = hist.find(h => h.measure.key === 'VELOCITA MEDIA VENTO');
  const entryMax = hist.find(h => h.measure.key === 'VELOCITA MAX VENTO');
  const entryMin = hist.find(h => h.measure.key === 'VELOCITA MIN VENTO');
  const entryDir = hist.find(h => h.measure.key === 'DIREZIONE_VENTO');
  const entryRaf = hist.find(h => h.measure.key === 'DIREZIONE RAFFICA');

  const medLast = entryMedia?.data?.slice(-1)[0];
  const medVal = medLast ? parseFloat(medLast.value) : null;

  const maxExtreme = entryMax ? getExtreme(entryMax, 'max') : null;
  const minExtreme = entryMin ? getExtreme(entryMin, 'min') : null;

  const dirLast = entryDir?.data?.slice(-1)[0];
  const rafLast = entryRaf?.data?.slice(-1)[0];

  const items = [
    medLast && {
      label: 'Media',
      formatted: `${medVal.toFixed(1)} ${entryMedia.measure.descrizione_unita_misura}`,
      time: medLast.timestamp || medLast.timedate
    },
    maxExtreme && {
      label: 'Massima (periodo)',
      formatted: `${maxExtreme.value.toFixed(1)} ${entryMax.measure.descrizione_unita_misura}`,
      time: maxExtreme.time
    },
    minExtreme && {
      label: 'Minima (periodo)',
      formatted: `${minExtreme.value.toFixed(1)} ${entryMin.measure.descrizione_unita_misura}`,
      time: minExtreme.time
    },
    dirLast && {
      label: 'Direzione',
      formatted: getWindDir(parseFloat(dirLast.value)),
      time: dirLast.timestamp || dirLast.timedate
    },
    rafLast && {
      label: 'Direzione raffica',
      formatted: getWindDir(parseFloat(rafLast.value)),
      time: rafLast.timestamp || rafLast.timedate
    }
  ].filter(Boolean);

  const buildTrace = (entry, label, color) => {
    if (!entry?.data?.length) return null;
    return {
      x: entry.data.map(d => new Date(d.timestamp || d.timedate)),
      y: entry.data.map(d => parseFloat(d.value)),
      type: 'scatter',
      mode: 'lines',
      name: label,
      line: { width: 2, color }
    };
  };

  const plotVelocity = [
    buildTrace(entryMedia, 'Media', '#2196F3'),
    buildTrace(entryMax, 'Max', '#f44336'),
    buildTrace(entryMin, 'Min', '#4caf50')
  ].filter(Boolean);

  const plotDirection = [
    buildTrace(entryDir, 'Direzione', '#FFC107')
  ].filter(Boolean);

  const direction = (entryRaf?.data ?? []).map(d => parseFloat(d.value));
  const speed = (entryMax?.data ?? []).map(d => parseFloat(d.value));

  return (
    <Card sx={{ '&:hover': { boxShadow: 6 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ color: param.color }}>{param.icon}</Box>
          <Typography variant="h6">Vento</Typography>
        </Box>

        {/* Valori istantanei */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          {items.map((d, i) => (
            <Box key={i}>
              <Typography variant="h5">{d.formatted}</Typography>
              <Typography variant="body2" color="text.secondary">{d.label}</Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {(toRomeDate(d.time) || lastUpd)?.toLocaleString('it-IT', {
                  timeZone: 'Europe/Rome',
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Grafico velocità */}
        {plotVelocity.length > 0 && (
          <Plot
            data={plotVelocity}
            layout={{
              title: { text: 'Velocità del vento', font: { size: 16 } },
              height: 200,
              margin: { t: 30, b: 70, l: 40, r: 10 },
              xaxis: {
                title: 'Orario',
                type: 'date',
                tickformat: '%d/%m, %H:%M'
              },
              yaxis: {
                title: entryMedia?.measure?.descrizione_unita_misura || 'm/s',
                autorange: true
              },
              legend: {
                orientation: 'h',
                x: 0,
                y: 1.15
              }
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        )}

        {/* Grafico direzione */}
        {plotDirection.length > 0 && (
          <Plot
            data={plotDirection}
            layout={{
              title: { text: 'Direzione del vento', font: { size: 16 } },
              height: 200,
              margin: { t: 40, b: 40, l: 40, r: 10 },
              xaxis: {
                title: 'Orario',
                type: 'date',
                tickformat: '%d/%m, %H:%M'
              },
              yaxis: {
                title: 'Gradi',
                autorange: true
              },
              legend: { orientation: 'h' }
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        )}

        {/* Rosa dei venti */}
        <Plot
          data={(() => {
            const speedRanges = [
              { min: 0.0, max: 0.2, color: '#00e676', label: 'Bf 0 (0.0 – 0.2 m/s)' },   // verde chiaro
              { min: 0.3, max: 1.5, color: '#66eb6e', label: 'Bf 1 (0.3 – 1.5 m/s)' },
              { min: 1.6, max: 3.3, color: '#c6ea4b', label: 'Bf 2 (1.6 – 3.3 m/s)' },
              { min: 3.4, max: 5.4, color: '#fdd835', label: 'Bf 3 (3.4 – 5.4 m/s)' },   // giallo
              { min: 5.5, max: 7.9, color: '#ffc107', label: 'Bf 4 (5.5 – 7.9 m/s)' },
              { min: 8.0, max: 10.7, color: '#ff9800', label: 'Bf 5 (8.0 – 10.7 m/s)' },
              { min: 10.8, max: 13.8, color: '#ff7043', label: 'Bf 6 (10.8 – 13.8 m/s)' },
              { min: 13.9, max: 17.1, color: '#ff5722', label: 'Bf 7 (13.9 – 17.1 m/s)' },
              { min: 17.2, max: 20.7, color: '#f44336', label: 'Bf 8 (17.2 – 20.7 m/s)' },
              { min: 20.8, max: 24.4, color: '#e53935', label: 'Bf 9 (20.8 – 24.4 m/s)' },
              { min: 24.5, max: 28.4, color: '#d32f2f', label: 'Bf 10 (24.5 – 28.4 m/s)' },
              { min: 28.5, max: 32.6, color: '#c62828', label: 'Bf 11 (28.5 – 32.6 m/s)' },
              { min: 32.7, max: Infinity, color: '#b71c1c', label: 'Bf 12 (> 32.6 m/s)' } // rosso scuro
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
          })()}
          layout={{
            title: { text: 'Rosa dei venti (raffiche)', font: { size: 16 } },
            polar: {
              angularaxis: {
                rotation: 90,
                direction: 'clockwise',
                tickmode: 'array',
                tickvals: [0, 45, 90, 135, 180, 225, 270, 315],
                ticktext: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
              },
              radialaxis: { ticksuffix: '%', angle: 90, showline: false }
            },
            showlegend: true,
            legend: { orientation: 'v', x: 0.85, y: 0.5 },
            margin: { t: 60, b: 20, l: 20, r: 140 },
            height: 400
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: '100%' }}
        />
      </CardContent>
    </Card>
  );
};

export default WindCard;
