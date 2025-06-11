import { useState } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Page, Main, getRelativeDate, useToast } from '@flumens';
import {
  IonHeader,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
  IonList,
  IonButton,
  IonItemDivider,
} from '@ionic/react';
import InfoBackgroundMessage from 'common/Components/InfoBackgroundMessage';
import savedSamples, { uploadAllSamples } from 'models/collections/samples';
import Sample from 'models/sample';
import Survey from './Survey';
import VirtualList from './VirtualList';
import './styles.scss';

// https://stackoverflow.com/questions/47112393/getting-the-iphone-x-safe-area-using-javascript
const rawSafeAreaTop =
  getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
const SAFE_AREA_TOP = parseInt(rawSafeAreaTop.replace('px', ''), 10);
const LIST_PADDING = 90 + SAFE_AREA_TOP;
const LIST_ITEM_HEIGHT = 80 + 10; // 10px for padding
const LIST_ITEM_DIVIDER_HEIGHT = 35;

function bySurveyDate(sample1: Sample, sample2: Sample) {
  const date1 = new Date(sample1.data.date);
  const moveToTop = !date1 || date1.toString() === 'Invalid Date';
  if (moveToTop) return -1;

  const date2 = new Date(sample2.data.date);
  return date2.getTime() - date1.getTime();
}

function roundDate(date: number) {
  let roundedDate = date - (date % (24 * 60 * 60 * 1000)); // subtract amount of time since midnight
  roundedDate += new Date().getTimezoneOffset() * 60 * 1000; // add on the timezone offset
  return new Date(roundedDate);
}

const getSurveys = (surveys: Sample[], showUploadAll?: boolean) => {
  const dates: any = [];
  const dateIndices: any = [];

  const groupedSurveys: any = [];
  let counter: any = {};

  // eslint-disable-next-line @getify/proper-arrows/name
  [...surveys].forEach(survey => {
    const date = roundDate(new Date(survey.data.date).getTime()).toString();
    if (!dates.includes(date) && date !== 'Invalid Date') {
      dates.push(date);
      dateIndices.push(groupedSurveys.length);
      counter = { date, count: 0 };
      groupedSurveys.push(counter);
    }

    counter.count += 1;
    groupedSurveys.push(survey);
  });

  // eslint-disable-next-line react/no-unstable-nested-components
  const Item = ({ index, ...itemProps }: { index: number }) => {
    if (dateIndices.includes(index)) {
      const { date, count } = groupedSurveys[index];

      return (
        <IonItemDivider key={date} style={(itemProps as any).style} mode="ios">
          <IonLabel color="dark">{getRelativeDate(date)}</IonLabel>
          {count > 1 && <IonLabel slot="end">{count}</IonLabel>}
        </IonItemDivider>
      );
    }

    const sample = groupedSurveys[index];

    return (
      <Survey
        key={sample.cid}
        sample={sample}
        uploadIsPrimary={!showUploadAll}
        {...itemProps}
      />
    );
  };

  const itemCount = surveys.length + dateIndices.length;

  const getItemSize = (index: number) =>
    dateIndices.includes(index) ? LIST_ITEM_DIVIDER_HEIGHT : LIST_ITEM_HEIGHT;

  return (
    <VirtualList
      itemCount={itemCount}
      itemSize={getItemSize}
      Item={Item}
      topPadding={LIST_PADDING}
      bottomPadding={LIST_ITEM_HEIGHT / 2}
    />
  );
};

const UserRecordsComponent = () => {
  const toast = useToast();

  const [segment, setSegment] = useState('pending');

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);
  };

  const getSamplesList = (uploaded?: boolean) => {
    const byUploadStatus = (sample: Sample) =>
      uploaded ? sample.syncedAt : !sample.syncedAt;

    return savedSamples.filter(byUploadStatus).sort(bySurveyDate);
  };

  const onUploadAll = () => {
    return uploadAllSamples(toast);
  };

  const getUploadedSurveys = () => {
    const surveys = getSamplesList(true);

    if (!surveys.length) {
      return (
        <InfoBackgroundMessage className="mb-[10vh] mt-[20vh]">
          You have no submitted records
        </InfoBackgroundMessage>
      );
    }

    return getSurveys(surveys);
  };

  const isFinished = (sample: Sample) => sample.metadata.saved;
  const hasManyPending = () => getSamplesList().filter(isFinished).length > 3;

  const getPendingSurveys = () => {
    const surveys = getSamplesList(false);

    if (!surveys.length) {
      return (
        <InfoBackgroundMessage className="mb-[10vh] mt-[20vh]">
          You have no pending records
        </InfoBackgroundMessage>
      );
    }

    const showUploadAll = hasManyPending();

    return (
      <>
        {getSurveys(surveys, showUploadAll)}

        {showUploadAll && (
          <IonButton
            expand="block"
            size="small"
            color="secondary"
            className="upload-all-button"
            onClick={onUploadAll}
          >
            Upload All
          </IonButton>
        )}
      </>
    );
  };

  const getPendingSurveysCount = () => {
    const pendingSurveys = getSamplesList();

    if (!pendingSurveys.length) {
      return null;
    }

    return (
      <IonBadge color="danger" slot="end">
        {pendingSurveys.length}
      </IonBadge>
    );
  };

  const getUploadedSurveysCount = () => {
    const uploadedSurveys = getSamplesList(true);

    if (!uploadedSurveys.length) {
      return null;
    }

    return (
      <IonBadge color="medium" slot="end">
        {uploadedSurveys.length}
      </IonBadge>
    );
  };

  const showingPending = segment === 'pending';
  const showingUploaded = segment === 'uploaded';

  return (
    <Page id="home-user-surveys">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonSegment onIonChange={onSegmentClick} value={segment}>
            <IonSegmentButton value="pending">
              <IonLabel className="ion-text-wrap">
                <T>Pending</T> {getPendingSurveysCount()}
              </IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="uploaded">
              <IonLabel className="ion-text-wrap">
                <T>Uploaded</T>
                {getUploadedSurveysCount()}
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <Main>
        {showingPending && <IonList>{getPendingSurveys()}</IonList>}

        {showingUploaded && <IonList>{getUploadedSurveys()}</IonList>}
      </Main>
    </Page>
  );
};

export default observer(UserRecordsComponent);
