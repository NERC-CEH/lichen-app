import { Page, Main, Header, Section } from '@flumens';

const { P, H } = Section;

const Component: React.FC = () => (
  <Page id="about">
    <Header title="About" />
    <Main>
      <Section>
        <P>
          This mobile app is a tool for assessing the status of nitrogen air
          pollution in your area by surveying lichen on trees. By identifying
          the presence or absence of 9 nitrogen sensitive and 8 non-sensitive
          lichens on tree trunks and branches you can get an estimate of how
          polluted your area is.
        </P>
      </Section>
      <Section>
        <H>Why Nitrogen?</H>
        <P>
          Excess nitrogen can cause eutrophication and acidification effects on
          semi-natural ecosystems, which in turn can lead to species composition
          changes and other deleterious effects. Species adapted to low nitrogen
          (N) availability are at a greater risk from this effect including many
          slow-growing lower plants, notably lichens and mosses.
        </P>
      </Section>
      <Section>
        <H>Lichens as indicators of nitrogen air quality</H>
        <P>
          Lichens are composite organisms comprising a symbiotic relationship
          between a single species of fungus and one or more species of algae.
          The fungal partner provides structure and protection for the algae,
          which through photosynthesis provides energy and assimilates for the
          fungal partner.
        </P>
        <P>
          As organisms without roots, lichens obtain their nutrients from the
          atmosphere and so are highly susceptible to changes in atmospheric
          chemistry.
        </P>
        <P>
          Recent research on oak and birch trees across the UK has identified
          lichens that are sensitive to, or tolerant of, increasing
          concentrations of nitrogen pollutants in the atmosphere. In the field,
          the response to increasing atmospheric nitrogen pollution can be
          measured by the decrease in N-sensitive lichens and the increase in
          N-tolerant lichens.
        </P>
        <P>
          Emphasis has been placed on the use of indicator lichens that do not
          require identification at the microscopic level and that are least
          likely to be confused with other species. In some cases, all species
          in a genus are known to be sensitive (e.g. species of <i>Usnea</i> –
          the beard lichens). In other cases, an individual species within a
          genus may be an indicator (e.g. <i>Lecidella elaeochroma</i>).
        </P>
      </Section>
      <Section>
        <H>What does the app include and do?</H>
        <P>
          Includes a simple identification key to epiphytic lichens growing on
          oak and birch trees that show distinct sensitivity to, or tolerance
          of, atmospheric N pollution.
        </P>
        <P>
          Provides a simple robust method to determine levels of risk to a
          habitat from gaseous nitrogen pollution by calculating a standardised
          nitrogen air quality index (NAQI).
        </P>
        <P>How to do simple chemical tests.</P>
        <P>
          Indicates nitrogen air quality at the location of the trees sampled.
        </P>
      </Section>
      <Section>
        <H>Further information</H>
        <P>
          <a
            href="http://www.apis.ac.uk/nitrogen-lichen-field-manual"
            target="_blank"
            rel="noreferrer"
          >
            Guide to using a lichen-based index to assess nitrogen air quality
          </a>
          <br /> <br />
          <a
            href="http://www.apis.ac.uk/impacts-air-pollution-lichens-and-bryophytes-mosses-and-liverworts"
            target="_blank"
            rel="noreferrer"
          >
            Impacts of air pollution on Lichens and Bryophytes
          </a>
          <br /> <br />
          <a
            href="http://www.apis.ac.uk/overview/pollutants/overview_N_deposition.htm"
            target="_blank"
            rel="noreferrer"
          >
            Nitrogen deposition
          </a>
          <br /> <br />
        </P>
      </Section>
    </Main>
  </Page>
);

export default Component;
