import { warningOutline } from 'ionicons/icons';
import { Header, InfoMessage, Main, Page, Section } from '@flumens';

const { P } = Section;

const ChemicalTesting = () => {
  return (
    <Page id="chemical-testing">
      <Header title="Chemical tests" />
      <Main>
        <Section>
          <P>
            This can help confirm species identifications. Some lichens change
            colour when a drop of bleach or caustic soda is applied.
          </P>
          <P>
            Watch for a pink to red colour change where you have applied bleach
            or caustic soda to the lichen medulla. This colour change may fade
            rapidly. If the colour changes this is called a + reaction.
          </P>
          <P className="border-t py-3">
            <strong>Bleach.</strong> Put a small amount of the thin bleach (not
            the thick bleach which has other chemicals in) in a small labelled
            dropper bottle (old eye-dropper bottles are ideal) .
          </P>
          <P className="border-t py-3">
            <strong>Caustic soda.</strong> Measure 100ml of water ( tap water
            will do) and add quarter teaspoon of household caustic soda ( use
            cook measuring set for a quarter of a teaspoon). The solution will
            heat up and when it has cooled put it in a separate labelled dropper
            bottle *** health and safety warning.
          </P>
          <P className="border-t py-3">
            <strong>To do the tests:</strong> Scratch the surface of the lichen
            carefully to remove the upper layer (cortex) and expose the fungal
            layer (medulla) beneath. Note that you do not need to do this on
            thin crusts)
          </P>
          <P className="border-t py-3">
            Put a drop of either bleach (C) or dilute caustic soda (K) on the
            scratched spot and watch for a colour change. C- or K- means no
            colour change.
          </P>
          <P className="border-t py-3">
            <strong>Bleach response:</strong> fast reaction turning pink or red
            if positive but fading rapidly, signified by C+ in the text .
          </P>
          <P className="border-t py-3">
            <strong>Caustic soda response:</strong> slower reaction (c.1min) and
            if positive may turn yellow, orange or blood red signified by K+ in
            the text.
          </P>
        </Section>

        <InfoMessage
          color="warning"
          icon={warningOutline}
          className="[--background:var(--color-warning-50)]"
        >
          <div className="text-warning-900">
            Get an adult to make up the household soda solution, as it is highly
            caustic. When making up the solutions wear rubber gloves and take
            care not to get the solutions on your skin or clothes.
          </div>
        </InfoMessage>

        <InfoMessage
          color="warning"
          icon={warningOutline}
          className="[--background:var(--color-warning-50)]"
        >
          <div className="text-warning-900">
            * Take care when doing these tests. <br /> * Use ‘Milton’ (available
            from a chemist) or the cheapest supermarket bleach without
            additives. <br /> * Carry a small amount in a clearly labelled leak
            proof dropper bottle. <br /> * Avoid contact with skin and clothing.{' '}
            <br /> * Read the manufacturers safety warnings on the bottle prior
            to use.
          </div>
        </InfoMessage>
      </Main>
    </Page>
  );
};

export default ChemicalTesting;
