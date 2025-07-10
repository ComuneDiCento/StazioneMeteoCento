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
