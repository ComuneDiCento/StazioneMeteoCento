import { FC } from "react";
import { Container, Row, Col, Icon, LinkList, LinkListItem } from "design-react-kit";


export const Footer: FC = () => {
  return (<footer className="it-footer">
    <div className="it-footer-main">
      <Container>
        <section>
          <Row className="clearfix">
            <Col sm={12}>
              <div className="it-brand-wrapper">
                <a
                  className=""
                  href="https://www.comune.cento.fe.it"
                  title="Vai alla pagina del Comune"
                >
                  <Icon icon="stemma.png" />
                  <div className="it-brand-text">
                    <h2>
                      Comune di Cento
                    </h2>

                  </div>
                </a>
              </div>
            </Col>
          </Row>
        </section>
        <section className="py-4 border-white border-top">
          <Row>
            <Col
              className="pb-2"
              lg={4}
              md={4}
            >
              <h4>
                <a
                  href="https://www.comune.cento.fe.it"
                  title="Vai alla pagina del Comune"
                >
                  Contatti
                </a>
              </h4>
              <p>
                <strong>
                  Comune di Cento
                </strong><br />
                Via M.Provenzali 15, Cento, FE - 44042 (Sede Legale)<br />
                Via Guercino 62, Cento, FE - 44042 (Sede operativa)<br />
                Codice Fiscale: 81000520387<br />
                Partita IVA: 00152130381
              </p>
              <LinkList className="footer-list clearfix">
                PEC
                <LinkListItem
                  href="mailto:comune.cento@cert.comune.cento.fe.it"
                  title="Vai alla pagina: Posta Elettronica Certificata"
                >
                  comune.cento@cert.comune.cento.fe.it
                </LinkListItem>
                Centralino Unico: <a href="tel:0516843111">0516843111</a><br />
                URP numero verde: <a href="tel:800375515"><strong>800 375515</strong></a>

              </LinkList>
            </Col>

          </Row>
        </section>
      </Container>
    </div>

  </footer>
  );
}

export default Footer;