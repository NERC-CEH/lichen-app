import { useState } from 'react';
import clsx from 'clsx';
import { Main, Page, Section } from '@flumens';
import {
  IonHeader,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/react';
import branchImage from './branch.jpg';
import naqiImage from './naqi.jpg';
import './styles.scss';
import trunkImage from './trunk.jpg';

const { P, H } = Section;

const Guide = () => {
  const [segment, setSegment] = useState<'general' | 'survey' | 'results'>(
    'general'
  );

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);
  };

  return (
    <Page id="guide">
      <IonHeader className="ion-no-border">
        <IonToolbar className="fixed [--background:transparent]">
          <IonSegment onIonChange={onSegmentClick} value={segment}>
            <IonSegmentButton value="general">
              <IonLabel className="ion-text-wrap">Set-up</IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="survey">
              <IonLabel className="ion-text-wrap">Surveying</IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="results">
              <IonLabel className="ion-text-wrap">Results</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <Main className={clsx(segment !== 'general' && 'hidden')}>
        <div>
          <Section>
            <H>Essential equipment to take with you</H>
            <ol className="list-decimal p-3 pl-8 [&>li::marker]:font-bold [&>li]:my-3">
              <li>
                Mobile phone with GPS and compass support (or take your own
                compass and hand held GPS device).
              </li>
              <li>
                OS Map to record the location (back up if signal is poor for
                mobile GPS).
              </li>
              <li>Tape measure.</li>
              <li>x 10 hand lens as some lichen features are small.</li>
            </ol>
          </Section>

          <Section>
            <H>Establish suitability of site for survey</H>
            <ol className="list-decimal p-3 pl-8 [&>li::marker]:font-bold [&>li]:my-3">
              <li>
                Identify five oak or five birch trees (not a mixture of the two)
                growing under similar environmental conditions (not densely
                planted or shaded).
              </li>
              <li>Trees that are covered in ivy should not be used.</li>
              <li>
                Trees should be single stemmed (standard) with a straight trunk,
                less than 40 cm in girth.
              </li>
              <li>Look for availability / accessibility of branches.</li>
              <li>
                Avoid sites on calcareous soils. Determine the calcium carbonate
                (CaCO3) soil levels in your location at{' '}
                <a
                  href="http://maps.bgs.ac.uk/soilportal/wmsviewer.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  this website.
                </a>{' '}
              </li>
            </ol>
          </Section>
        </div>
      </Main>

      <Main className={clsx(segment !== 'survey' && 'hidden')}>
        <div>
          <Section>
            <H>Under the General tab</H>
            <ul className="list-disc p-3 pl-8 [&>li::marker]:font-bold [&>li]:my-3">
              <li>Enter the Date.</li>
              <li>Select your tree type Birch or Oak.</li>
              <li>
                Record the site location by clicking on the ‘Locate’ button. If
                you are having problems with this you can pick from the Map tab
                or add a ‘Grid reference’ and ‘Location’ name. Use the Comment
                box to add anything else about the site, weather conditions, did
                you enjoy the day out etc. - anything of interest.
              </li>
            </ul>
          </Section>

          <Section>
            <H>Under the Trunks tab</H>
            <ol className="list-disc p-3 pl-8 [&>li::marker]:font-bold [&>li]:my-3">
              <li>
                Locate a 50 x 10 cm area on each of the three aspects of the
                tree between 1.0 and 1.5 m above ground level.
                <img
                  src={trunkImage}
                  alt="trunk"
                  className="mx-auto my-4 block max-w-[200px]"
                />
              </li>
              <li>For each trunk record the circumference.</li>
              <li>
                For each aspect (East, West, South) select the lichens you can
                identify. Use the ‘info’ button to help with identification.
                Then click the next aspect (top right). Go through to ‘Finish’,
                then start the next trunk (top right ‘Trunk 2’).
              </li>
              <li>Complete all 5 trunks then you can move to the branches.</li>
            </ol>
          </Section>

          <Section>
            <H>Under the Branches tab</H>
            <ol className="list-disc p-3 pl-8 [&>li::marker]:font-bold [&>li]:my-3">
              <li>
                Choose 3-5 branches on the same tree species (oak or birch) as
                used in the trunk survey. Do not use fallen branches.
              </li>
              <li>
                If there are no suitable branches on these trees, branches from
                other nearby trees of the same species can be used.
              </li>
              <li>Choose branches in an open aspect and within easy reach.</li>
              <li>
                For each branch record the lichens in each Zone (1,2,3)
                represented by approximate distances along each main branch,
                measured from the growing tip.
                <img src={branchImage} alt="" />
              </li>
              <li>
                You may have to modify these zones depending on the growth form
                of the trees that you are using. Use the ‘info’ button to help
                with identification. Then click the next zone (top right). Go
                through to Finish, then start the next branch (top right ‘Branch
                2’).
              </li>
              <li>Complete all 5 branches.</li>
            </ol>
          </Section>
        </div>
      </Main>

      <Main className={clsx(segment !== 'results' && 'hidden')}>
        <div>
          <Section>
            <P>
              Click on the ‘Results’ button. For each test (trunks and branches)
              the app will work out your lichen indicator score (LIS) and the
              NAQI score (Nitrogen Air Quality Index). The LIS is based on the
              difference between the presence of N-tolerant and N-sensitive
              lichens on three aspects of the trunk or on three zones of the
              branch.
            </P>
          </Section>

          <Section>
            <H>NAQI Graph</H>
            <P>The app will produce the LIS and the NAQI automatically.</P>
            <P>
              Doing it manually - the range of lichen indicator scores (LIS) is
              given on the Y axis (from -3 to 3). Read across the graph until
              you meet the broken line drawn for branches or soild line for
              trunks. Drop down a line perpendicular to the X axis and this is
              your NAQI. A simple description of air quality is indicated by the
              coloured zones (e.g. a LIS of “2”, based on branches, meets the
              line for branches in the green zone (left side of the graph),
              which is indicative of a clean site with negligible gaseous N
              pollution; a LIS of “-2” meets the line for branches in the salmon
              pink zone, which is indicative of a very N polluted site).
            </P>
            <img src={naqiImage} alt="" className="block p-4" />
          </Section>

          <Section>
            <H>Interpreting your score in a local and regional context</H>
            <ul className="list-disc p-3 pl-8 [&>li::marker]:font-bold [&>li]:my-3">
              <li>
                The LIS for a site can vary from +3 for clean (low
                concentrations of gaseous N compounds) sites where only
                N-sensitive indicator lichens are present, to -3 for very high
                concentrations of gaseous nitrogen compounds sites where only
                N-tolerant indicator lichens are present.
              </li>
              <li>
                Transitional sites may have both N-tolerant and N-sensitive taxa
                present, especially where conditions are changing.
              </li>
              <li>
                If you compare the NAQI based on LIS for trunks with the LIS for
                branches and find that the LIS for branches is lower than that
                of the trunks, it suggests that conditions are deteriorating in
                your site.
              </li>
              <li>
                However, there may be sites where conditions are improving (e.g.
                sites formerly affected by acid rain where there is very little
                lichen cover on the trunk, and yet the branches have N-sensitive
                taxa present).
              </li>
            </ul>
          </Section>
        </div>
      </Main>
    </Page>
  );
};

export default Guide;
