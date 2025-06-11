import { FC } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { IonSpinner } from '@ionic/react';
import { Badge, Button } from 'common/flumens';
import Sample from 'models/sample';
import './styles.scss';

interface Props {
  sample: Sample;
  onUpload: (e?: any) => void;
  uploadIsPrimary?: boolean;
}

const UsersSurveys: FC<Props> = ({ onUpload, sample, uploadIsPrimary }) => {
  const { saved } = sample.metadata;
  const isDisabled = sample.isUploaded;

  if (!saved) {
    return <Badge>Draft</Badge>;
  }

  if (sample.isSynchronising) return <IonSpinner className="survey-status" />;

  if (isDisabled) return null;

  const isValid = !sample.validateRemote();

  return (
    <Button
      color={isValid ? 'secondary' : undefined}
      fill={!uploadIsPrimary ? 'outline' : undefined}
      onPress={onUpload}
      preventDefault
      className={clsx(
        'max-w-28 shrink-0 whitespace-nowrap px-4 py-1',
        isValid && 'bg-secondary-500',
        !isValid && 'opacity-50'
      )}
    >
      Upload
    </Button>
  );
};

export default observer(UsersSurveys);
