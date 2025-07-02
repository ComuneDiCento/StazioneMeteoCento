import React from 'react';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import Plot from 'react-plotly.js';
import { toRomeDate } from '../../utils/dataUtils';

const getExtreme = (entry, type) => {
  const nums = entry.data.map(d => parseFloat(d.value));
  const finiteNums = nums.filter(Number.isFinite);
  if (!finiteNums.length) return null;

  const ext = type === 'min' ? Math.min(...finiteNums) : Math.max(...finiteNums);
  const idx = nums.indexOf(ext);
  const time = entry.data[idx]?.timestamp || entry.data[idx]?.timedate;
  return { value: ext, time };
};

const GenericWeatherCard = ({ param, data, fmtTime, lastUpd }) => {
  const hist = data || [];

  const values = param.keys.reduce((acc, k) => {
    const entry = hist.find(h => h.measure.key === k);
    if (!entry || !entry.data?.length) return acc;

    const { data: entryData, measure: { key: entryKey, descrizione_unita_misura: unit } } = entry;
    const label = param.keyLabels[entryKey] || entryKey;
    const last = entryData[entryData.length - 1];
    let currentVal = parseFloat(last.value);

    const max = getExtreme(entry, 'max');
    const min = getExtreme(entry, 'min');

    acc.push({
      key: entryKey,
      label,
      unit,
      current: { value: currentVal, time: last.timestamp || last.timedate },
      max,
      min,
      data: entryData
    });

    return acc;
  }, []);

  const traces = values.map((v, i) => ({
    x: v.data.map(d => new Date(d.timestamp || d.timedate)),
    y: v.data.map(d => {
      let val = parseFloat(d.value);
      if (v.key === 'PIOGGIA CUMULATA') {
        val -= parseFloat(v.data[0].value);
      }
      return val;
    }),
    type: 'scatter',
    mode: 'lines',
    name: v.label,
    line: { width: 2, color: param.chartColors?.[i] || param.color }
  }));

  return (
    <Card sx={{ '&:hover': { boxShadow: 6 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ color: param.color }}>{param.icon}</Box>
          <Typography variant="h6">{param.label}</Typography>
        </Box>

        <Grid container spacing={2} mb={2}>
          {values.map((v, i) => (
            <React.Fragment key={i}>
              {/* Valore attuale */}
              <Grid item xs={12} sm={4}>
                <Typography variant="h5">{v.current.value.toFixed(1)} {v.unit}</Typography>
                <Typography variant="body2" color="text.secondary">{v.label}</Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  {(toRomeDate(v.current.time) || lastUpd)?.toLocaleString('it-IT', {
                    timeZone: 'Europe/Rome',
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Grid>

              {/* Valore massimo */}
              <Grid item xs={12} sm={4}>
                <Typography variant="h5">{v.max?.value.toFixed(1)} {v.unit}</Typography>
                <Typography variant="body2" color="text.secondary">Massima</Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  {(toRomeDate(v.max?.time) || lastUpd)?.toLocaleString('it-IT', {
                    timeZone: 'Europe/Rome',
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Grid>

              {/* Valore minimo */}
              <Grid item xs={12} sm={4}>
                <Typography variant="h5">{v.min?.value.toFixed(1)} {v.unit}</Typography>
                <Typography variant="body2" color="text.secondary">Minima</Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  {(toRomeDate(v.min?.time) || lastUpd)?.toLocaleString('it-IT', {
                    timeZone: 'Europe/Rome',
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>

        {traces.length > 0 && (
          <Plot
            data={traces}
            layout={{
              height: 240,
              margin: { t: 10, r: 10, b: 40, l: 40 },
              xaxis: {
                title: 'Orario',
                tickformat: '%d/%m, %H:%M',
                type: 'date'
              },
              yaxis: {
                title: values[0]?.unit || '',
                autorange: true
              },
              legend: { orientation: 'h' }
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default GenericWeatherCard;
