import { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useAlert, useToast } from '@flumens';
import {
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  NavContext,
} from '@ionic/react';
import { useUserStatusCheck } from 'common/models/user';
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

    const isSynced = sample.syncedAt;
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
  const { navigate } = useContext(NavContext);
  const toast = useToast();
  const deleteSurvey = useSurveyDeletePrompt(sample);
  const checkUserStatus = useUserStatusCheck();
  const checkSampleStatus = useValidateCheck(sample);

  const deleteSurveyWrap = () => deleteSurvey();

  const onUpload = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.upload().catch(toast.error);
  };

  const openItem = () => {
    if (sample.isSynchronising) return; // fixes button onPressUp and other accidental navigation
    navigate(`/survey/${sample.cid}`);
  };

  return (
    <IonItemSliding className="survey-list-item" style={style}>
      <IonItem onClick={openItem} detail={false}>
        <div className="survey-info-container">
          <div className="">
            <div className="pl-3 font-semibold">Record</div>

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
