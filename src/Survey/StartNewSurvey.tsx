import { useEffect, useContext } from 'react';
import { useAlert } from '@flumens';
import { NavContext } from '@ionic/react';
import appModel from 'models/app';
import savedSamples from 'models/collections/samples';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';

async function showDraftAlert(alert: any) {
  const showDraftDialog = (resolve: any) => {
    alert({
      header: 'Draft',
      message: 'Previous survey draft exists, would you like to continue it?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Create new',
          role: 'cancel',
          handler: () => {
            resolve(false);
          },
        },
        {
          text: 'Continue',
          role: 'confirm',
          handler: () => {
            resolve(true);
          },
        },
      ],
    });
  };
  return new Promise(showDraftDialog);
}

async function getDraft(alert: any) {
  const draftID = appModel.data.draftId;
  if (draftID) {
    const draftById = ({ cid }: Sample) => cid === draftID;
    const draftSample = savedSamples.find(draftById);
    if (draftSample && !draftSample.isDisabled) {
      const continueDraftRecord = await showDraftAlert(alert);
      if (continueDraftRecord) {
        return draftSample;
      }
    }
  }

  return null;
}

async function getNewSample(survey: any) {
  const sample = await survey.create!({ Sample, Occurrence });
  await sample.save();

  savedSamples.push(sample);

  appModel.data.draftId = sample.cid;

  return sample;
}

type Props = {
  survey: any;
};

function StartNewSurvey({ survey }: Props): null {
  const context = useContext(NavContext);
  const alert = useAlert();

  const pickDraftOrCreateSampleWrap = () => {
    const pickDraftOrCreateSample = async () => {
      let sample = await getDraft(alert);

      if (!sample) {
        sample = await getNewSample(survey);
      }

      context.navigate(`/survey/${sample!.cid}`, 'none', 'replace');
    };

    pickDraftOrCreateSample();
  };
  useEffect(pickDraftOrCreateSampleWrap, []);

  return null;
}

// eslint-disable-next-line @getify/proper-arrows/name
StartNewSurvey.with = (survey: any) => {
  const StartNewSurveyWithRouter = (params: any) => (
    <StartNewSurvey survey={survey} {...params} />
  );
  return StartNewSurveyWithRouter;
};

export default StartNewSurvey;
