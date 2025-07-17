import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Row, Col, Card, CardHeader, CardTitle, CardBody } from 'design-react-kit';
import { toRomeDate } from '../../utils/dataUtils';

const thresholdMap = {
    pm10: 50,
    no2: 200,
    o3_max_1h: 180,
    o3_max_8h: 120
};

const AirQualityCard = ({ param, data = [], lastUpd }) => {
    const [plotKey, setPlotKey] = useState(0);
    useEffect(() => {
        const handleResize = () => setPlotKey(k => k + 1);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const latestValues = param.keys
        .filter(key => !key.startsWith('superamenti_'))
        .filter(key => !key.includes('obiettivo'))
        .map((key, index) => {
            const entry = data.find(h => h.measure.key === key);
            if (!entry?.data?.length) return null;

            const last = entry.data[entry.data.length - 1];

            const isSuperamento = key.startsWith('superamenti_');

            return {
                key,
                label: param.keyLabels[key] || key,
                value: isSuperamento ? parseInt(last.value) : parseFloat(last.value),
                unit: entry.measure.descrizione_unita_misura || '',
                time: new Date(last.date),
                color: param.chartColors[index % param.chartColors.length]
            };
        })
        .filter(Boolean);


    // Solo i parametri NON di superamento per i grafici
    const traces = latestValues
        .filter(val => !val.key.startsWith('superamenti_'))
        .map(val => {
            const entry = data.find(h => h.measure.key === val.key);
            if (!entry?.data?.length) return null;

            return {
                x: entry.data.map(d => new Date(d.date)),
                y: entry.data.map(d => parseFloat(d.value)),
                type: 'scatter',
                mode: 'lines',
                name: val.label,
                line: { width: 2, color: val.color }
            };
        }).filter(Boolean);

    return (
        <Card className="card-bg" spacing>
            <CardHeader>
                <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ color: param.color }}>{param.icon}</div>
                    <h4 className="card-title mb-0" style={{ marginLeft: '8px' }}>{param.label}</h4>
                </CardTitle>

                <Row className="mb-3">
                    {latestValues.map((d, i) => (
                        <Col sm={6} className="mb-3" key={i}>
                            <h5 className="text-white"

                                style={{
                                    backgroundColor: (() => {
                                        const threshold = thresholdMap[d.key];
                                        if (threshold === undefined || d.key.startsWith('superamenti_')) return 'transparent';
                                        return d.value > threshold ? '#ff6700' : 'green';
                                    })(),
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    display: 'inline-block'
                                }}
                            >
                                {d.key.startsWith('superamenti_')
                                    ? `${Math.round(d.value)} ${d.unit}`
                                    : `${d.value.toFixed(1)} ${d.unit}`}
                            </h5>
                            <small className="text-secondary d-block">{d.label}</small>
                            <small className="text-muted d-block">
                                {d.time.toLocaleString('it-IT', {
                                    timeZone: 'Europe/Rome',
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </small>
                        </Col>
                    ))}
                </Row>
            </CardHeader>

            <CardBody>
                {/* Grafico combinato per O3 */}
                {(() => {
                    const o3Keys = ['o3_max_1h', 'o3_max_8h'];
                    const o3Values = latestValues.filter(
                        val => o3Keys.includes(val.key)
                    );
                    const o3Traces = o3Values.map(val => {
                        const entry = data.find(h => h.measure.key === val.key);
                        if (!entry?.data?.length) return null;

                        return {
                            x: entry.data.map(d => new Date(d.date)),
                            y: entry.data.map(d => parseFloat(d.value)),
                            type: 'bar',
                            barmode: 'group',
                            name: val.label,
                            line: { width: 2, color: val.color }
                        };
                    }).filter(Boolean);

                    if (!o3Traces.length) return null;

                    return (
                        <div className="mb-4">
                            <h6>Ozono (O₃)</h6>
                            <Plot
                                key={`o3-${plotKey}`}
                                data={o3Traces}
                                layout={{
                                    height: 250,
                                    margin: { t: 10, r: 10, b: 30, l: 40 },
                                    xaxis: {
                                        title: 'Data',
                                        tickformat: '%d/%m<br>%H:%M',
                                        type: 'date',
                                        fixedrange: true
                                    },
                                    yaxis: {
                                        title: 'µg/m³',
                                        autorange: true,
                                        fixedrange: true
                                    },
                                    legend: {
                                        orientation: 'h',
                                        x: 0.5,
                                        y: -0.3,
                                        xanchor: 'center',
                                        yanchor: 'top'
                                    },
                                    shapes: [
                                        ...['o3_max_1h', 'o3_max_8h'].map(k => {
                                            const threshold = thresholdMap[k];
                                            if (!threshold) return null;
                                            return {
                                                type: 'line',
                                                xref: 'paper',
                                                x0: 0,
                                                x1: 1,
                                                y0: threshold,
                                                y1: threshold,
                                                line: {
                                                    color: 'red',
                                                    width: 2,
                                                    dash: 'dash'
                                                }
                                            };
                                        }).filter(Boolean)
                                    ]
                                }}
                                config={{ displayModeBar: false, responsive: true, scrollZoom: false, doubleClick: false, displaylogo: false, modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d'] }}
                                style={{ width: '100%' }}
                            />
                        </div>
                    );
                })()}

                {/* Grafici separati per gli altri parametri */}
                {latestValues
                    .filter(val =>
                        !val.key.startsWith('superamenti_') &&
                        !['o3_max_1h', 'o3_max_8h'].includes(val.key)
                    )
                    .map(val => {
                        const entry = data.find(h => h.measure.key === val.key);
                        if (!entry?.data?.length) return null;

                        const trace = {
                            x: entry.data.map(d => new Date(d.date)),
                            y: entry.data.map(d => parseFloat(d.value)),
                            type: 'bar',
                            barmode: 'group',
                            name: val.label,
                            line: { width: 2, color: val.color }
                        };

                        return (
                            <div key={`${val.key}-${plotKey}`} className="mb-4">
                                <h6>{val.label}</h6>
                                <Plot
                                    data={[trace]}
                                    layout={{
                                        height: 250,
                                        margin: { t: 10, r: 10, b: 30, l: 40 },
                                        xaxis: {
                                            title: 'Data',
                                            tickformat: '%d/%m<br>%H:%M',
                                            type: 'date',
                                            fixedrange: true
                                        },
                                        yaxis: {
                                            title: `${val.unit}`,
                                            autorange: true,
                                            fixedrange: true
                                        },
                                        showlegend: false,
                                        shapes: thresholdMap[val.key]
                                            ? [{
                                                type: 'line',
                                                xref: 'paper',
                                                x0: 0,
                                                x1: 1,
                                                y0: thresholdMap[val.key],
                                                y1: thresholdMap[val.key],
                                                line: {
                                                    color: 'red',
                                                    width: 2,
                                                    dash: 'dash'
                                                }
                                            }]
                                            : []
                                    }}
                                    config={{ displayModeBar: false, responsive: true, scrollZoom: false, doubleClick: false, displaylogo: false, modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d'] }}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        );
                    })}
            </CardBody>



        </Card>
    );
};

export default AirQualityCard;
