import { Header, Page, Main, Section } from '@flumens';
import logo from 'common/images/flumens.svg';
import CEHlogo from './UKCEH-Logo-Main-colour.png';

const { P, H } = Section;

export default () => (
  <Page id="credits">
    <Header title="Credits" />
    <Main>
      <Section>
        <P>
          <img src={CEHlogo} alt="" className="w-full" />
        </P>
      </Section>

      <Section>
        <H>Guide</H>
        <P>
          The guide was written by P.A. Wolseley, I.D. Leith, L. Sheppard,
          J.E.J. Lewis, P.D. Crittenden and M.A. Sutton, based on a PhD thesis
          “Biomonitoring for atmospheric nitrogen pollution using epiphytic
          lichens and bryophytes” by J.E.J. Lewis (University of Nottingham).
          Photographs are by Harry Taylor, Natural History Museum.{' '}
        </P>

        <P>
          The guide has been produced in collaboration with:
          <br />
          <br />
          <a href="http://www.ceh.ac.uk" target="_blank" rel="noreferrer">
            UK Centre for Ecology and Hydrology
          </a>
          <br />
          <br />
          <a href="http://www.nhm.ac.uk" target="_blank" rel="noreferrer">
            Natural History Museum
          </a>
          <br />
          <br />
          <a
            href="http://www.nottingham.ac.uk"
            target="_blank"
            rel="noreferrer"
          >
            The University of Nottingham
          </a>
          <br />
          <br />
          <a href="http://jncc.defra.gov.uk" target="_blank" rel="noreferrer">
            Joint Nature Conservation Committee
          </a>
          <br />
          <br />
          <a href="https://www.nature.scot" target="_blank" rel="noreferrer">
            Nature Scot
          </a>
          <br />
          <br />
          <a href="http://www.sepa.org.uk" target="_blank" rel="noreferrer">
            Scottish Environment Protection Agency
          </a>
          <br />
          <br />
          <a
            href="https://www.daera-ni.gov.uk/articles/northern-ireland-environment-agency"
            target="_blank"
            rel="noreferrer"
          >
            Northern Ireland Environment Agency
          </a>
          <br />
          <br />
        </P>
      </Section>

      <Section>
        <p className="mt-4">
          <a href="https://flumens.io">
            <img src={logo} alt="" className="m-auto block w-1/2 max-w-xs" />
          </a>
        </p>
        <P>
          This app was hand crafted with love by{' '}
          <a href="https://flumens.io" className="whitespace-nowrap">
            Flumens.
          </a>{' '}
          A technical consultancy that excels at building bespoke environmental
          science and community focussed solutions. For suggestions and feedback
          please do not hesitate to{' '}
          <a href="mailto:enquiries%40flumens.io?subject=App%20Feedback">
            contact us
          </a>
          .
        </P>
      </Section>
      <Section>
        <P>
          Lichen icon by ochre7 from{' '}
          <a
            href="https://thenounproject.com/browse/icons/term/lichen/"
            target="_blank"
            title="Lichen Icons"
            rel="noreferrer"
          >
            Noun Project
          </a>{' '}
          (CC BY 3.0)
        </P>
        <P>Tree icon by Ankush Syal (CC Attribution License).</P>
      </Section>
    </Main>
  </Page>
);
