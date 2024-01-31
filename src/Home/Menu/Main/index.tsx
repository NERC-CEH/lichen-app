import { observer } from 'mobx-react';
import {
  informationCircleOutline,
  heartCircleOutline,
  lockClosedOutline,
  shareOutline,
  openOutline,
  warningOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Main, InfoMessage, MenuAttrToggle } from '@flumens';
import {
  IonIcon,
  IonList,
  IonItem,
  IonItemDivider,
  IonLabel,
} from '@ionic/react';
import CONFIG from 'common/config';
import './styles.scss';

type Props = {
  sendAnalytics: boolean;
  onToggle: (sendAnalytics: string, checked: boolean) => void;
};

const MenuMain = ({ sendAnalytics, onToggle }: Props) => {
  const onSendAnalyticsToggle = (checked: boolean) =>
    onToggle('sendAnalytics', checked);

  return (
    <Main className="app-menu">
      <h1>Menu</h1>

      <IonList lines="full">
        <IonItemDivider>
          <IonLabel color="primary" className="text-left">
            <T>Info</T>
          </IonLabel>
        </IonItemDivider>
        <div className="rounded">
          <IonItem routerLink="/info/about" detail>
            <IonIcon
              icon={informationCircleOutline}
              size="small"
              slot="start"
            />
            <T>About</T>
          </IonItem>

          <IonItem routerLink="/info/credits" detail>
            <IonIcon icon={heartCircleOutline} size="small" slot="start" />
            <T>Credits</T>
          </IonItem>

          <IonItem routerLink="/info/chemical-testing" detail>
            <IonIcon icon={warningOutline} size="small" slot="start" />
            <T>How to do chemical tests</T>
          </IonItem>

          <IonItem
            href={`${CONFIG.backend.websiteUrl}/privacy-notice`}
            target="_blank"
            detail
            detailIcon={openOutline}
          >
            <IonIcon icon={lockClosedOutline} size="small" slot="start" />
            <T>Privacy Policy</T>
          </IonItem>
        </div>

        <IonItemDivider>
          <IonLabel color="primary" className="text-left">
            Settings
          </IonLabel>
        </IonItemDivider>
        <div className="rounded">
          <MenuAttrToggle
            icon={shareOutline}
            label="Share App Analytics"
            value={sendAnalytics}
            onChange={onSendAnalyticsToggle}
          />
          <InfoMessage color="dark">
            Share app crash data so we can make the app more reliable.
          </InfoMessage>
        </div>

        <div className="app-version-container">
          <p>App version: {`v${CONFIG.version} (${CONFIG.build})`}</p>
        </div>
      </IonList>
    </Main>
  );
};

export default observer(MenuMain);
