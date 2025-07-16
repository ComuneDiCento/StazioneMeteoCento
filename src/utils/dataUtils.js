// utils/dataUtils.js

const API_BASE_URL = 'https://sensornet-api.lepida.it';

// Converte timestamp in formato europeo, gestendo spazi e Zulu
export const toRomeDate = (utc) => utc ? new Date(`${utc.replace(' ', 'T')}Z`) : null;

// Restituisce un array di stringhe YYYY-MM-DD per gli ultimi N giorni
export const getLastNDates = (n = 3) => {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

// Scarica dati storici da una lista di sensori negli ultimi N ore
export const fetchHistoricalData = async (sensorObjects, hours = 48) => {
  const requiredDays = Math.ceil((hours + new Date().getHours()) / 24);
  const days = getLastNDates(requiredDays);

  const data = await Promise.all(sensorObjects.map(async obj => {
    // 1) fetch dei dati raw
    const raw = await Promise.all(days.map(date =>
      fetch(`${API_BASE_URL}/getMeasureRealTimeData/${obj.id}/${date}`)
        .then(r => r.json())
    ));

    // 2) flatten, filter su window oraria e sort per data
    const combined = raw.flat()
      .map(d => ({ ...d, date: toRomeDate(d.timestamp || d.timedate) }))
      .filter(d => d.date && Date.now() - d.date.getTime() <= hours * 3600 * 1000)
      .sort((a, b) => a.date - b.date);

    // 3) qui schiaccio obj.measure nel livello superiore
    const flatMeasure = {
      id: obj.id,
      key: obj.key,
      // spread delle proprietà custom (es. descrizione_unita_misura)
      ...obj.measure
    };

    return {
      measure: flatMeasure,
      data: combined
    };
  }));

  return data;
};


// Calcola min/max di un dato storico per un certo key
export const getMinMaxForKey = (histArray, key) => {
  const entry = histArray.find(h => h.measure.key === key);
  if (!entry || !entry.data.length) return { min: null, max: null };

  let min = Infinity;
  let max = -Infinity;

  for (const { value } of entry.data) {
    const num = parseFloat(value);
    if (isFinite(num)) {
      if (num < min) min = num;
      if (num > max) max = num;
    }
  }

  return {
    min: min === Infinity ? null : min,
    max: max === -Infinity ? null : max
  };
};

// Estrae i dati della stazione CENTO dalla pagina ARPAE Ferrara
// Estrae i dati ARPAE Cento e li converte in formato compatibile con fetchHistoricalData
export const fetchArpaeCentoData = async () => {
  const response = await fetch('https://apps.arpae.it/qualita-aria/bollettino-qa-provinciale/fe');
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Estrai la data dal campo input del datepicker
  const dateInput = doc.querySelector('#datepicker');
  const dateString = dateInput && dateInput.value ? dateInput.value : null;

  let dataMisura = new Date(); // default fallback
  if (dateString) {
    const [day, month, year] = dateString.split('-');
    dataMisura = new Date(`${year}-${month}-${day}`);
  }

  const rows = [...doc.querySelectorAll("table.dati tbody tr")];
  let centoData = null;

  for (const row of rows) {
    const cells = row.querySelectorAll('td');
    const station = cells[1]?.textContent.trim();

    if (station && station.includes("CENTO")) {
      centoData = {
        pm10: cells[2]?.textContent.trim() || null,
        pm25: cells[3]?.textContent.trim() || null,
        no2: cells[4]?.textContent.trim() || null,
        o3_max_1h: cells[5]?.textContent.trim() || null,
        o3_max_8h: cells[6]?.textContent.trim() || null,
        benzene: cells[7]?.textContent.trim() || null,
        co: cells[8]?.textContent.trim() || null,
        so2: cells[9]?.textContent.trim() || null,
        superamenti_pm10: cells[10]?.textContent.trim() || null,
        superamenti_no2: cells[11]?.textContent.trim() || null,
        superamenti_o3_info: cells[12]?.textContent.trim() || null,
        superamenti_o3_obiettivo: cells[13]?.textContent.trim() || null
      };
      break;
    }
  }

  if (!centoData) return [];

  const makeEntry = (key, value) => ({
    measure: {
      id: `arpae_cento_${key}`,
      key,
      fonte: 'ARPAE',
      stazione: 'CENTO'
    },
    data: value && !isNaN(parseFloat(value)) ? [{
      value: parseFloat(value),
      date: dataMisura
    }] : []
  });

  return Object.entries(centoData).map(([key, value]) => makeEntry(key, value));
};


export const fetchArpaeCentoAirDataTODEL = async () => {
  const url = `https://apps.arpae.it/REST/qa_stazioni?projection={"foto":0}&where={"_id":"8000038"}`;

  const response = await fetch(url);
  const json = await response.json();
  const stationData = json._items?.[0];

  if (!stationData || !stationData.dati) return [];

  const mapKey = {
    pm10: "pm10",
    pm25: "pm25",
    no2: "no2",
    o3_max_1h: "o3mediaorariamax",
    o3_max_8h: "o3media8oremax",
    benzene: "benzene",
    co: "co",
    so2: "so2",
    superamenti_pm10: "pm10supgiorni",
    superamenti_no2: "no2supore",
    superamenti_o3_info: "o3supore",
    superamenti_o3_obiettivo: "o3supgiorni"
  };

  // Per ogni chiave logica, genera una serie storica di valori
  const makeEntry = (key, sourceKey) => {
    const series = Object.entries(stationData.dati)
      .map(([dateKey, dataObj]) => {
        const rawValue = dataObj[sourceKey]?.trim();
        const value = rawValue && !isNaN(parseFloat(rawValue)) ? parseFloat(rawValue) : null;

        if (value === null) return null;

        const date = new Date(
          `${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(6)}`
        );

        return { value, date };
      })
      .filter(entry => entry !== null);

    return {
      measure: {
        id: `arpae_cento_${key}`,
        key,
        fonte: 'ARPAE',
        stazione: 'CENTO'
      },
      data: series
    };
  };

  return Object.entries(mapKey).map(([key, sourceKey]) => makeEntry(key, sourceKey));
};

export const fetchArpaeCentoAirData = async (hours = 48) => {
  const url = `https://apps.arpae.it/REST/qa_stazioni?projection={"foto":0}&where={"_id":"8000038"}`;

  const response = await fetch(url);
  const json = await response.json();
  const stationData = json._items?.[0];

  if (!stationData || !stationData.dati) return [];

  const mapKey = {
    pm10: "pm10",
    pm25: "pm25",
    no2: "no2",
    o3_max_1h: "o3mediaorariamax",
    o3_max_8h: "o3media8oremax",
    benzene: "benzene",
    co: "co",
    so2: "so2",
    superamenti_pm10: "pm10supgiorni",
    superamenti_no2: "no2supore",
    superamenti_o3_info: "o3supore",
    superamenti_o3_obiettivo: "o3supgiorni"
  };

  // Converti le ore in giorni interi (es: 47 ore = 1 giorno)
  const days = Math.floor(hours / 24);

  // Calcola la data di cutoff (escludendo oggi)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Inizio del giorno corrente
  const cutoffDate = new Date(today);
  cutoffDate.setDate(today.getDate() - days); // cutoff = oggi - giorni interi

  const makeEntry = (key, sourceKey) => {
    const series = Object.entries(stationData.dati)
      .map(([dateKey, dataObj]) => {
        const rawValue = dataObj[sourceKey]?.trim();
        const value = rawValue && !isNaN(parseFloat(rawValue)) ? parseFloat(rawValue) : null;

        if (value === null) return null;

        // Crea una data a mezzanotte da YYYYMMDD
        const date = new Date(
          `${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(6)}T00:00:00`
        );

        // Esclude i dati precedenti alla data di cutoff
        if (date < cutoffDate) return null;

        return { value, date };
      })
      .filter(entry => entry !== null);

    return {
      measure: {
        id: `arpae_cento_${key}`,
        key,
        fonte: 'ARPAE',
        stazione: 'CENTO'
      },
      data: series
    };
  };

  return Object.entries(mapKey).map(([key, sourceKey]) => makeEntry(key, sourceKey));
};

export const getAllerta = async() =>{
  const url = 'https://www.comune.cento.fe.it/it'; // Cambia qui con l'altra pagina se diversa

  const response = await fetch(url);
  const html = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const result = {};

  const bollettino = doc.querySelector("#widget_alerts .col-md-12.mb-4 b");
  result.bollettino = bollettino ? bollettino.textContent.trim() : "Nessun bollettino";

  const codiceColore = doc.querySelector(".widget-descrizione .lead");
  result.codice_colore = codiceColore ? codiceColore.textContent.trim() : "Non trovato";

  const table = doc.querySelector(".widget-table table");
  result.criticita = [];

  if (table) {
    const giorni = Array.from(table.querySelectorAll("thead th"))
      .slice(1)
      .map(th => th.textContent.trim());

    table.querySelectorAll("tbody tr").forEach(row => {
      const cols = row.querySelectorAll("td");
      const tipo = row.querySelector("td").textContent.trim();
      const livelli = Array.from(cols)
        .slice(1)
        .map((td, i) => ({
          giorno: giorni[i],
          livello: td.textContent.trim() || "N/D"
        }));

      result.criticita.push({ tipo, livelli });
    });

    return result;
  }


};

