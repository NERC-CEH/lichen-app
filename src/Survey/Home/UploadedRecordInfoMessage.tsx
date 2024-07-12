import { informationCircleOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { InfoMessage } from '@flumens';
import { IonIcon } from '@ionic/react';

const UploadedRecordInfoMessage = () => {
  return (
    <InfoMessage
      color="tertiary"
      prefix={<IonIcon src={informationCircleOutline} className="size-6" />}
      skipTranslation
      className="m-2"
    >
      <T>
        This record has been submitted and cannot be edited within this App.
      </T>
    </InfoMessage>
  );
};

export default UploadedRecordInfoMessage;
