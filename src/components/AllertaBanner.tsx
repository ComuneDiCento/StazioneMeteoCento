import React from 'react';
import { Card, CardHeader, CardBody, Row, Col} from 'design-react-kit';
import './allerta-banner.css';

interface Criticita {
  tipo: string;
  livelli: { giorno: string; livello: string }[];
}

interface AllertaData {
  bollettino: string;
  codice_colore: string;
  criticita: Criticita[];
}

interface AllertaBannerProps {
  allerta: AllertaData;
}

const livelloBadgeClass: Record<string, string> = {
  VERDE: 'verde',
  GIALLO: 'giallo',
  ARANCIONE: 'arancio',
  ROSSO: 'rosso'
};

const AllertaBanner: React.FC<AllertaBannerProps> = ({ allerta }) => {
  const codice = allerta.codice_colore.toUpperCase();

  let cardClass = 'border-secondary bg-secondary';
  if (codice.includes('VERDE')) cardClass = 'allertameteo-verde';
  else if (codice.includes('GIALL')) cardClass = 'allertameteo-giallo';
  else if (codice.includes('ARANC')) cardClass = 'allertameteo-arancio';
  else if (codice.includes('ROSS')) cardClass = 'allertameteo-rosso';

  const giorniUnici = Array.from(
    new Set(allerta.criticita.flatMap(c => c.livelli.map(l => l.giorno)))
  ).slice(0, 2);

  return (
    <Row>
      <Col className="col-12">
        <Card className = {`card-bg`}>
        <CardHeader className={`${cardClass}`}>
                        <div className="fw-bold text-center">
              <h5>Stato allerta: {allerta.codice_colore}</h5>
            </div>
            <div className="text-center">{allerta.bollettino}</div>
            </CardHeader>
          <CardBody>

            <div className="d-flex justify-content-center">
              <table className="table table-sm  w-auto text-start">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    {giorniUnici.map(giorno => (
                      <th key={giorno} className="text-center">{giorno}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allerta.criticita.map(c => (
                    <tr key={c.tipo}>
                      <td>{c.tipo.replace(/\s*\(.*?\)/g, '')}</td>
                      {giorniUnici.map(giorno => {
                        const livello = c.livelli.find(l => l.giorno === giorno)?.livello;
                        const badgeClass = livello && livelloBadgeClass[livello];
                        return (
                          <td key={giorno} className="text-center">
                            {livello && livello !== 'N/D' && (
                              <span
                                className={`badge text-uppercase badgemeteo-${badgeClass}`}
                                style={{ fontSize: '0.65rem', minWidth: '3rem' }}
                              >
                                {livello}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-center">
              <a
                href="https://www.comune.cento.fe.it/it/civil-defence-alerts"
                className="btn btn-primary btn-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vedi maggiori informazioni
              </a>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default AllertaBanner;
