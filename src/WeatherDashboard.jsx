import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
} from "design-react-kit";
import WeatherCardWrapper from "./components/cards/WeatherCardWrapper";
import { fetchHistoricalData } from "./utils/dataUtils";

// Bootstrap Icons
import "bootstrap-icons/font/bootstrap-icons.css";

const WEATHER_STATIONS = {
  MAIN: 12494,
  WIND: 12501,
};

const weatherParameters = [
  {
    icon: <i className="bi bi-thermometer-half"></i>,
    label: "Temperatura",
    keys: ["TEMPERATURA", "MAX", "MIN"],
  },
  {
    icon: <i className="bi bi-droplet"></i>,
    label: "Umidità",
    keys: ["UMIDITA"],
  },
  {
    icon: <i className="bi bi-arrows-collapse"></i>,
    label: "Pressione",
    keys: ["PRESSIONE"],
  },
  {
    icon: <i className="bi bi-wind"></i>,
    label: "Vento",
    keys: ["VELOCITA MEDIA VENTO", "DIREZIONE_VENTO"],
  },
  {
    icon: <i className="bi bi-brightness-high"></i>,
    label: "Radiazione",
    keys: ["RADIAZIONE"],
  },
  {
    icon: <i className="bi bi-cloud-drizzle"></i>,
    label: "Pioggia",
    keys: ["PIOGGIA CUMULATA"],
  },
];

const leftLabels = ["Temperatura", "Umidità", "Pressione", "Radiazione"];
const rightLabels = ["Vento", "Pioggia"];

const WeatherDashboard = () => {
  const [intervalMs, setIntervalMs] = useState(60000);
  const [historyHours, setHistoryHours] = useState(48);
  const [weather, setWeather] = useState({ main: null, wind: null });
  const [histMap, setHistMap] = useState({});
  const [error, setError] = useState("");

  const fetchStation = useCallback(async (id) => {
    const r1 = await fetch(`https://sensornet-api.lepida.it/getMeasuresID/${id}`);
    if (!r1.ok) throw new Error("Errore misure");
    const ms = await r1.json();
    const ids = ms.map((m) => m.id_misura).join(",");
    const r2 = await fetch(`https://sensornet-api.lepida.it/getMeasureListLastData/${ids}`);
    if (!r2.ok) throw new Error("Errore dati recenti");
    const data = await r2.json();
    return { measures: ms, data };
  }, []);

  const refresh = useCallback(async () => {
    try {
      setError("");
      const [m, w] = await Promise.all([
        fetchStation(WEATHER_STATIONS.MAIN),
        fetchStation(WEATHER_STATIONS.WIND),
      ]);
      setWeather({ main: m, wind: w });
    } catch (e) {
      setError(e.message);
    }
  }, [fetchStation]);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, intervalMs);
    return () => clearInterval(iv);
  }, [refresh, intervalMs]);

  const leftParams = weatherParameters.filter((p) => leftLabels.includes(p.label));
  const rightParams = weatherParameters.filter((p) => rightLabels.includes(p.label));

  return (
    <Container className="my-5">
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="it-heading-xl">
            Stazione Meteo Cento (Ultime {historyHours}h)
          </h1>
        </Col>
        <Col xs="auto">
<FormGroup>
  <Label for="interval-select">Intervallo</Label>
  <select
    className="form-control"
    id="interval-select"
    value={intervalMs}
    onChange={(e) => setIntervalMs(Number(e.target.value))}
  >
    <option value={30000}>30s</option>
    <option value={60000}>1m</option>
    <option value={300000}>5m</option>
    <option value={600000}>10m</option>
  </select>
</FormGroup>
        </Col>
        <Col xs="auto">
<FormGroup>
  <Label for="history-select">Storico</Label>
  <select
    className="form-control"
    id="history-select"
    value={historyHours}
    onChange={(e) => setHistoryHours(Number(e.target.value))}
  >
    <option value={24}>24h</option>
    <option value={48}>48h</option>
    <option value={72}>72h</option>
    <option value={96}>96h</option>
  </select>
</FormGroup>

        </Col>
      </Row>

      <p>
        Dati dal Comune di Cento, progetto RetePAIOT. Codice su
        <a href="https://github.com/ComuneDiCento/StazioneMeteoCento"> GitHub</a>.
      </p>

      {error && <Alert color="danger">{error}</Alert>}

      <Row>
        <Col md={6}>
          {leftParams.map((p) => (
            <WeatherCardWrapper
              key={p.label}
              param={p}
              data={histMap[p.label]}
            />
          ))}
        </Col>
        <Col md={6}>
          {rightParams.map((p) => (
            <WeatherCardWrapper
              key={p.label}
              param={p}
              data={histMap[p.label]}
            />
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default WeatherDashboard;