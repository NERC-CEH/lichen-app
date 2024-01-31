import { FC } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { IonSpinner, IonButton } from '@ionic/react';
import Sample from 'models/sample';
import './styles.scss';

interface Props {
  sample: Sample;
  onUpload: (e?: any) => void;
  uploadIsPrimary?: boolean;
}

const UsersSurveys: FC<Props> = ({ onUpload, sample, uploadIsPrimary }) => {
  const { saved } = sample.metadata;
  const { synchronising } = sample.remote;
  const isDisabled = sample.isUploaded();

  if (!saved) {
    return (
      <span className="mr-3 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-700/10">
        <T>Draft</T>
      </span>
    );
  }

  if (synchronising) return <IonSpinner className="survey-status" />;

  if (isDisabled) return null;

  return (
    <IonButton
      className="survey-status survey-status-upload"
      onClick={onUpload}
      fill={uploadIsPrimary ? undefined : 'outline'}
    >
      <T>Upload</T>
    </IonButton>
  );
};

export default observer(UsersSurveys);
