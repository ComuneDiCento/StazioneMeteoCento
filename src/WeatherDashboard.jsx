import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, FormGroup, Label, Select, Alert, Button } from 'design-react-kit';
import { ThermometerHalf, Droplet, Speedometer, Wind, Sun, CloudRain } from 'react-bootstrap-icons';
import WeatherCardWrapper from './components/cards/WeatherCardWrapper';
import { fetchHistoricalData } from './utils/dataUtils';

const weatherParameters = [
  {
    icon: <ThermometerHalf />, label: 'Temperatura',
    keys: ['TEMPERATURA', 'MAX', 'MIN'],
    keyLabels: {
      'TEMPERATURA': 'Temperatura attuale',
      'MAX': 'Massima',
      'MIN': 'Minima'
    },
    chartColors: ['#FF5722', '#FF8A65', '#FFAB91'], color: '#FF5722'
  },
  {
    icon: <Droplet />, label: 'Umidità',
    keys: ['UMIDITA'],
    keyLabels: { UMIDITA: 'Umidità Relativa' },
    chartColors: ['#2196F3'], color: '#2196F3'
  },
  {
    icon: <Speedometer />, label: 'Pressione',
    keys: ['PRESSIONE'],
    keyLabels: { PRESSIONE: 'Pressione Atmosferica' },
    chartColors: ['#9C27B0'], color: '#9C27B0'
  },
  {
    icon: <Wind />, label: 'Vento',
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
    icon: <Sun />, label: 'Radiazione',
    keys: ['RADIAZIONE', 'RADIAZIONE MAX'],
    keyLabels: {
      'RADIAZIONE': 'Radiazione',
      'RADIAZIONE MAX': 'Rad. massima'
    },
    chartColors: ['#FFC107', '#FFD54F'], color: '#FFC107'
  },
  {
    icon: <CloudRain />, label: 'Pioggia',
    keys: ['PIOGGIA CUMULATA', 'PIOGGIA INCREMENTALE'],
    keyLabels: {
      'PIOGGIA CUMULATA': 'Cumulata',
      'PIOGGIA INCREMENTALE': 'Incrementale'
    },
    chartColors: ['#4CAF50', '#81C784'], color: '#4CAF50'
  }
];


const WEATHER_STATIONS = { MAIN: 12494, WIND: 12501 };

const leftLabels = ['Temperatura', 'Umidità', 'Pressione', 'Radiazione'];
const rightLabels = ['Vento', 'Pioggia'];

const leftParams = weatherParameters.filter(p => leftLabels.includes(p.label));
const rightParams = weatherParameters.filter(p => rightLabels.includes(p.label));

const fmtTime = date => date?.toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' });

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
      const vals = data.map(pt => parseFloat(pt.value));
      return { data: vals, label: param.keyLabels[measure.key] || measure.key, color: param.chartColors[j] };
    });
    return { xAxis, series };
  };

  return (
    <div className="it-page-section">
      <Container>
        <Row className="justify-content-between align-items-center mb-4">
          {/* Colonna per il titolo */}
          <Col xs="auto">
            <h1 className="it-heading-xl mb-0">
              Stazione Meteo - Comune di Cento (Ultime {historyHours}h)
            </h1>
          </Col>

          {/* Colonna per i selettori */}
          <Col xs="auto">
            <div className="d-flex align-items-center">
              <FormGroup className="me-3 mb-0">
                <Label for="interval-select" className="mb-0">Intervallo</Label>
                <Select
                  id="interval-select"
                  value={intervalMs}
                  onChange={value => setIntervalMs(Number(value))}                >
                  <option value={30000}>30s</option>
                  <option value={60000}>1m</option>
                  <option value={300000}>5m</option>
                  <option value={600000}>10m</option>
                </Select>
              </FormGroup>

              <FormGroup className="mb-0">
                <Label for="history-select" className="mb-0">Storico</Label>
                <Select
                  id="history-select"
                  value={historyHours}
                  onChange={value => setHistoryHours(Number(value))}
                >
                  <option value={24}>24h</option>
                  <option value={48}>48h</option>
                  <option value={72}>72h</option>
                  <option value={96}>96h</option>
                </Select>
              </FormGroup>
            </div>
          </Col>

          {/* Colonna per l'ultimo aggiornamento */}
          {lastUpd && (
            <Col xs="auto">
              <span className="text-muted">
                Ultimo aggiornamento: {fmtTime(lastUpd)}
              </span>
            </Col>
          )}
        </Row>


        <p>
          Dati provenienti dalla stazione meteo installata nel <a href="https://comune.cento.fe.it">Comune di Cento</a> (presso la sede della Polizia Locale) da <a href="https://lepida.it">Lepida S.c.p.A.</a> nell'ambito del progetto <a href="https://retepaiot.it">RetePAIOT</a> della <a href="https://www.regione.emilia-romagna.it/">Regione Emilia-Romagna</a>.<br />
          <i>I sorgenti di questa pagina sono all'indirizzo <a href="https://github.com/ComuneDiCento/StazioneMeteoCento">https://github.com/ComuneDiCento/StazioneMeteoCento</a>.</i>
        </p>


        {error && <Alert color="danger">{error}</Alert>}

        <Row>
          <Col md={6}>
            {leftParams.map(p => (
              <div className="mb-4" key={p.label}>
                <WeatherCardWrapper
                  param={p}
                  data={histMap[p.label]}
                  lastUpd={lastUpd}
                  fmtTime={fmtTime}
                  formatChartData={formatChartData}
                />
              </div>
            ))}
          </Col>
          <Col md={6}>
            {rightParams.map(p => (
              <div className="mb-4" key={p.label}>
                <WeatherCardWrapper
                  param={p}
                  data={histMap[p.label]}
                  lastUpd={lastUpd}
                  fmtTime={fmtTime}
                  formatChartData={formatChartData}
                />
              </div>
            ))}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default WeatherDashboard;
