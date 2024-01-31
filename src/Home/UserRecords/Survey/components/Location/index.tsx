import { FC } from 'react';
import { observer } from 'mobx-react';
import { locationOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import GridRefValue from 'common/Components/GridRefValue';
import Sample from 'models/sample';
import './styles.scss';

type Props = {
  sample: Sample;
};

const Location: FC<Props> = ({ sample }) => {
  const { location } = sample.attrs;
  const locationName = location.name;

  return (
    <span className="location flex items-center">
      <IonIcon icon={locationOutline} className="mx-2" />
      {locationName || <GridRefValue sample={sample} />}
    </span>
  );
};

export default observer(Location);
