/* eslint-disable no-param-reassign */
import { useContext, useState } from 'react';
import { observer } from 'mobx-react';
import {
  checkmarkCircleOutline,
  chevronForwardOutline,
  locationOutline,
} from 'ionicons/icons';
import { useRouteMatch } from 'react-router';
import { Page, Main, Header, MenuAttrItem, useToast, Block } from '@flumens';
import {
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonToolbar,
  NavContext,
} from '@ionic/react';
import GridRefValue from 'common/Components/GridRefValue';
import { useUserStatusCheck } from 'common/models/user';
import Sample, { useValidateCheck } from 'models/sample';
import { commentAttr, treeTypeAttr } from 'Survey/config';
import { byTreeBranchNumber, byType, getLIS } from 'Survey/utils';
import MenuDateAttr from './MenuDateAttr';
import Results from './Results';
import SurveyHeaderButton from './SurveyHeaderButton';
import UploadedRecordInfoMessage from './UploadedRecordInfoMessage';

type Props = {
  sample: Sample;
};

const Home = ({ sample }: Props) => {
  const match = useRouteMatch();
  const toast = useToast();
  const { navigate } = useContext(NavContext);
  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

  const [segment, setSegment] = useState<
    'general' | 'trunks' | 'branches' | 'results'
  >('general');

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);
  };

  const _processDraft = async () => {
    const isValid = checkSampleStatus();
    if (!isValid) return;

    const saveAndReturn = () => {
      sample.cleanUp();
      sample.save();
      navigate(`/home/records`, 'root');
    };

    // eslint-disable-next-line no-param-reassign
    sample.metadata.saved = true;
    saveAndReturn();
  };

  const _processSubmission = async () => {
    const isValid = checkSampleStatus();
    if (!isValid) return;

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    sample.upload().catch(toast.error);

    navigate(`/home/records`, 'root');
  };

  const onSubmit = async () => {
    if (!sample.metadata.saved) {
      await _processDraft();
      return;
    }

    await _processSubmission();
  };

  const prettyGridRef = <GridRefValue sample={sample} />;

  const trunkLIS: any = getLIS('trunk', sample);
  const branchLIS: any = getLIS('branch', sample);

  const hasTrunkResults = Number.isFinite(trunkLIS);
  const hasBranchResults = Number.isFinite(branchLIS);

  const { isDisabled } = sample;

  const isSurveyComplete = hasTrunkResults || hasBranchResults;

  // eslint-disable-next-line react/no-unstable-nested-components
  const getLinkButton = (type: 'branch' | 'trunk') => (part: number) => {
    const hasEntries = sample.occurrences
      .filter(byType(type))
      .filter(byTreeBranchNumber(`${part}`)).length;

    const detailIcon = hasEntries
      ? checkmarkCircleOutline
      : chevronForwardOutline;

    return (
      <IonItem
        routerLink={`${match.url}/${type}/${part}`}
        detailIcon={detailIcon}
        key={part}
        className="capitalize"
      >
        <span className="mr-2 rounded-sm bg-neutral-100 px-2 text-sm text-neutral-700">
          {part}
        </span>
        {type}
      </IonItem>
    );
  };

  const recordAttrs = {
    record: sample.data,
    isDisabled,
  };

  return (
    <Page id="survey-home">
      <Header
        title="Survey"
        backButtonLabel="Home"
        rightSlot={<SurveyHeaderButton onClick={onSubmit} sample={sample} />}
      />
      <Main>
        {isDisabled && <UploadedRecordInfoMessage />}

        <IonToolbar className="[--background:transparent]">
          <IonSegment onIonChange={onSegmentClick} value={segment}>
            <IonSegmentButton value="general">
              <IonLabel className="ion-text-wrap">General</IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="trunks">
              <IonLabel className="ion-text-wrap">Trunks</IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="branches">
              <IonLabel className="ion-text-wrap">Branches</IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="results" disabled={!isSurveyComplete}>
              <IonLabel className="ion-text-wrap">Results</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>

        {segment === 'general' && (
          <IonList className="mt-3" lines="full">
            <div className="rounded-list">
              <MenuDateAttr model={sample} />

              <Block block={treeTypeAttr} {...recordAttrs} />

              <MenuAttrItem
                routerLink={`${match.url}/location`}
                value={prettyGridRef}
                icon={locationOutline}
                label="Location"
                skipValueTranslation
                disabled={isDisabled}
              />
              <Block block={commentAttr} {...recordAttrs} />
            </div>
          </IonList>
        )}

        {segment === 'trunks' && (
          <IonList>
            <div className="rounded-list">
              {[1, 2, 3, 4, 5].map(getLinkButton('trunk'))}
            </div>
          </IonList>
        )}

        {segment === 'branches' && (
          <IonList>
            <div className="rounded-list">
              {[1, 2, 3, 4, 5].map(getLinkButton('branch'))}
            </div>
          </IonList>
        )}

        {segment === 'results' && <Results sample={sample} />}
      </Main>
    </Page>
  );
};

export default observer(Home);
