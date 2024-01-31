import { FC } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useAlert, useToast } from '@flumens';
import {
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import Sample, { useValidateCheck } from 'models/sample';
import Location from './components/Location';
import OnlineStatus from './components/OnlineStatus';
import './styles.scss';

function useSurveyDeletePrompt(sample: Sample) {
  const alert = useAlert();

  const promptSurveyDelete = () => {
    let body =
      "This record hasn't been uploaded to the database yet. " +
      'Are you sure you want to remove it from your device?';

    const isSynced = sample.metadata.syncedOn;
    if (isSynced) {
      body =
        'Are you sure you want to remove this record from your device? ' +
        'Note: it will remain in the database.';
    }
    alert({
      header: 'Delete',
      message: body,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => sample.destroy(),
        },
      ],
    });
  };

  return promptSurveyDelete;
}

type Props = {
  sample: Sample;
  uploadIsPrimary?: boolean;
  style?: any;
};

const Survey: FC<Props> = ({ sample, style, uploadIsPrimary }) => {
  const toast = useToast();
  const deleteSurvey = useSurveyDeletePrompt(sample);
  const checkSampleStatus = useValidateCheck(sample);

  const { synchronising } = sample.remote;

  const href = !synchronising ? `/survey/${sample.cid}` : undefined;

  const deleteSurveyWrap = () => deleteSurvey();

  const onUpload = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.upload().catch(toast.error);
  };

  return (
    <IonItemSliding className="survey-list-item" style={style}>
      <IonItem routerLink={href} detail={false}>
        <div className="survey-info-container">
          <div className="">
            <div className="pl-3">Record</div>

            <div className="survey-info">
              <div className="details">
                <div className="core">
                  <Location sample={sample} />
                </div>
              </div>
            </div>
          </div>

          <OnlineStatus
            sample={sample}
            onUpload={onUpload}
            uploadIsPrimary={uploadIsPrimary}
          />
        </div>
      </IonItem>
      <IonItemOptions side="end">
        <IonItemOption color="danger" onClick={deleteSurveyWrap}>
          <T>Delete</T>
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default observer(Survey);
