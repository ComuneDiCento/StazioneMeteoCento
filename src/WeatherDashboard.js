import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid, Typography, Select, MenuItem,
  FormControl, InputLabel, Box, Container, Alert
} from '@mui/material';
import Plot from 'react-plotly.js';
import RefreshIcon from '@mui/icons-material/Refresh';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import CompressIcon from '@mui/icons-material/Compress';
import AirIcon from '@mui/icons-material/Air';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WeatherCardWrapper from './components/cards/WeatherCardWrapper';
import {
  fetchHistoricalData,
  toRomeDate
} from './utils/dataUtils';

const WEATHER_STATIONS = {
  MAIN: 12494,
  WIND: 12501
};

const weatherParameters = [
  {
    icon: <ThermostatIcon />, label: 'Temperatura',
    keys: ['TEMPERATURA', 'MAX', 'MIN'],
    keyLabels: {
      'TEMPERATURA': 'Temperatura attuale',
      'MAX': 'Massima',
      'MIN': 'Minima'
    },
    chartColors: ['#FF5722', '#FF8A65', '#FFAB91'], color: '#FF5722'
  },
  {
    icon: <OpacityIcon />, label: 'Umidità',
    keys: ['UMIDITA'], keyLabels: { UMIDITA: 'Umidità Relativa' },
    chartColors: ['#2196F3'], color: '#2196F3'
  },
  {
    icon: <CompressIcon />, label: 'Pressione',
    keys: ['PRESSIONE'], keyLabels: { PRESSIONE: 'Pressione Atmosferica' },
    chartColors: ['#9C27B0'], color: '#9C27B0'
  },
  {
    icon: <AirIcon />, label: 'Vento',
    keys: ['VELOCITA MEDIA VENTO', 'VELOCITA MAX VENTO', 'VELOCITA MIN VENTO', 'DIREZIONE_VENTO', 'DIREZIONE RAFFICA'],
    keyLabels: {
      'VELOCITA MEDIA VENTO': 'Velocità media',
      'VELOCITA MAX VENTO': 'Velocità max',
      'VELOCITA MIN VENTO': 'Velocità min',
      'DIREZIONE_VENTO': 'Direzione vento',
      'DIREZIONE RAFFICA': 'Direzione raffica'
    },
    chartColors: ['#00BCD4', '#4DD0E1', '#80DEEA', '#26C6DA', '#00ACC1'], color: '#00BCD4'
  },
  {
    icon: <WbSunnyIcon />, label: 'Radiazione',
    keys: ['RADIAZIONE', 'RADIAZIONE MAX'],
    keyLabels: {
      'RADIAZIONE': 'Radiazione',
      'RADIAZIONE MAX': 'Rad. massima'
    },
    chartColors: ['#FFC107', '#FFD54F'], color: '#FFC107'
  },
  {
    icon: <WaterDropIcon />, label: 'Pioggia',
    keys: ['PIOGGIA CUMULATA', 'PIOGGIA INCREMENTALE'],
    keyLabels: {
      'PIOGGIA CUMULATA': 'Cumulata',
      'PIOGGIA INCREMENTALE': 'Incrementale'
    },
    chartColors: ['#4CAF50', '#81C784'], color: '#4CAF50'
  }
];

const leftLabels = ['Temperatura', 'Umidità', 'Pressione', 'Radiazione'];
const rightLabels = ['Vento', 'Pioggia'];

const leftParams = weatherParameters.filter(p => leftLabels.includes(p.label));
const rightParams = weatherParameters.filter(p => rightLabels.includes(p.label));

const fmtTime = date =>
  date?.toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' });

const WeatherDashboard = () => {
  const [intervalMs, setIntervalMs] = useState(60000);
  const [historyHours, setHistoryHours] = useState(48);
  const [weather, setWeather] = useState({ main: null, wind: null });
  const [histMap, setHistMap] = useState({});
  const [error, setError] = useState('');
  const [lastUpd, setLastUpd] = useState(null);

  const fetchStation = useCallback(async id => {
    const r1 = await fetch(`https://sensornet-api.lepida.it/getMeasuresID/${id}`);
    if (!r1.ok) throw new Error('Errore misure');
    const ms = await r1.json();
    const ids = ms.map(m => m.id_misura).join(',');
    const r2 = await fetch(`https://sensornet-api.lepida.it/getMeasureListLastData/${ids}`);
    if (!r2.ok) throw new Error('Errore dati recenti');
    const data = await r2.json();
    return { measures: ms, data };
  }, []);

  const refresh = useCallback(async () => {
    try {
      setError('');
      const [m, w] = await Promise.all([
        fetchStation(WEATHER_STATIONS.MAIN),
        fetchStation(WEATHER_STATIONS.WIND)
      ]);
      setWeather({ main: m, wind: w });
      setLastUpd(new Date());

      for (const p of weatherParameters) {
        const allMeasures = [...m.measures, ...w.measures];
        const sensors = p.keys.map(k => {
          const mm = allMeasures.find(x => x.descrizione.includes(k));
          return mm ? { id: mm.id_misura, key: k, descrizione_unita_misura: mm.descrizione_unita_misura } : null;
        }).filter(Boolean);
        if (sensors.length) {
          const hist = await fetchHistoricalData(sensors, historyHours);
          setHistMap(prev => ({ ...prev, [p.label]: hist }));
        }
      }
    } catch (e) {
      setError(e.message);
    }
  }, [fetchStation, historyHours]);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, intervalMs);
    return () => clearInterval(iv);
  }, [refresh, intervalMs]);

  const formatChartData = (sets, idxs = sets.map((_, i) => i), param) => {
    if (!sets.length) return { xAxis: [], series: [] };

    const xAxis = sets[idxs[0]].data.map(pt => pt.date);
    const series = idxs.map((i, j) => {
      const { measure, data } = sets[i];
      const vals = data.reduce((acc, pt, index) => {
        const value = parseFloat(pt.value);
        if (measure.key === 'PIOGGIA CUMULATA') {
          return [...acc, value - (index === 0 ? value : acc[0])];
        }
        return [...acc, value];
      }, []);

      return { data: vals, label: param.keyLabels[measure.key] || measure.key, color: param.chartColors[j] };
    });

    return { xAxis, series };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h1">
          Stazione Meteo Cento  <small>(Ultime {historyHours}h)</small>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="interval-label">Agg.</InputLabel>
            <Select
              labelId="interval-label"
              value={intervalMs}
              label="Agg."
              onChange={e => setIntervalMs(e.target.value)}
            >
              <MenuItem value={30000}>30s</MenuItem>
              <MenuItem value={60000}>1m</MenuItem>
              <MenuItem value={300000}>5m</MenuItem>
              <MenuItem value={600000}>10m</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="history-label">Storico</InputLabel>
            <Select
              labelId="history-label"
              value={historyHours}
              label="Storico"
              onChange={e => setHistoryHours(e.target.value)}
            >
              <MenuItem value={24}>24h</MenuItem>
              <MenuItem value={48}>48h</MenuItem>
              <MenuItem value={72}>72h</MenuItem>
              <MenuItem value={96}>96h</MenuItem>
            </Select>
          </FormControl>

          {lastUpd && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RefreshIcon fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {fmtTime(lastUpd)}
              </Typography>
            </Box>
          )}
        </Box>

      </Box>
      <Typography variant="p">
        Dati provenienti dalla stazione meteo installata nel <a href="https://comune.cento.fe.it">Comune di Cento</a> (presso la sede della Polizia Locale) da <a href="https://lepida.it">Lepida S.c.p.A.</a> nell'ambito del progetto "<a href="https://retepaiot.it">RetePAIOT</a>" della <a href="https://www.regione.emilia-romagna.it/">Regione Emilia-Romagna</a>
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            {leftParams.map(p => (
              <Grid item xs={12} key={p.label}>
                <WeatherCardWrapper
                  param={p}
                  data={histMap[p.label]}
                  lastUpd={lastUpd}
                  fmtTime={fmtTime}
                  formatChartData={formatChartData}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            {rightParams.map(p => (
              <Grid item xs={12} key={p.label}>
                <WeatherCardWrapper
                  param={p}
                  data={histMap[p.label]}
                  lastUpd={lastUpd}
                  fmtTime={fmtTime}
                  formatChartData={formatChartData}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WeatherDashboard;
