import React from 'react';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import Plot from 'react-plotly.js';
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
      y: cumulata.data.map((d, i) => {
        const first = parseFloat(cumulata.data[0].value);
        return parseFloat(d.value) - first;
      }),
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
    <Card sx={{ '&:hover': { boxShadow: 6 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ color: param.color }}><WaterDropIcon /></Box>
          <Typography variant="h6">{param.label}</Typography>
        </Box>

        <Grid container spacing={2} mb={2}>
          {values.map((d, i) => (
            <Grid key={i} item xs={12} sm={6}>
              <Typography variant="h5">{d.value.toFixed(1)} {d.unit}</Typography>
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
            </Grid>
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
                type: 'date',
                tickformat: '%d/%m, %H:%M'
              },
              yaxis: {
                title: values[0]?.unit || 'mm',
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

export default RainCard;
