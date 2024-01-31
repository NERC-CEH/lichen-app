import { useEffect } from 'react';
import { observer } from 'mobx-react';
import {
  readerOutline,
  menuOutline,
  homeOutline,
  bookOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Route, Redirect } from 'react-router-dom';
import { App as AppPlugin } from '@capacitor/app';
import {
  IonTabs,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonRouterOutlet,
  useIonRouter,
} from '@ionic/react';
import PendingSurveysBadge from 'common/Components/PendingSurveysBadge';
import savedSamples from 'models/savedSamples';
import Guide from './Guide';
import Home from './Home';
import Menu from './Menu';
import Species from './Species';
import UserRecords from './UserRecords';
import './styles.scss';

const HomeController = () => {
  const ionRouter = useIonRouter();

  const exitApp = () => {
    const onExitApp = () => !ionRouter.canGoBack() && AppPlugin.exitApp();

    // eslint-disable-next-line @getify/proper-arrows/name
    document.addEventListener('ionBackButton', (ev: any) =>
      ev.detail.register(-1, onExitApp)
    );

    const removeEventListener = () =>
      document.addEventListener('ionBackButton', onExitApp);
    return removeEventListener;
  };
  useEffect(exitApp, []);

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Redirect exact path="/home" to="/home/home" />
        <Route path="/home/home" component={Home} exact />
        <Route path="/home/records" component={UserRecords} exact />
        <Route path="/home/species" component={Species} exact />
        <Route path="/home/guide" component={Guide} exact />
        <Route path="/home/menu" component={Menu} exact />
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/home/home">
          <IonIcon icon={homeOutline} />
          <IonLabel>
            <T>Home</T>
          </IonLabel>
        </IonTabButton>

        <IonTabButton tab="records" href="/home/records">
          <IonIcon icon={readerOutline} />
          <IonLabel>
            <T>Records</T>
          </IonLabel>
          <PendingSurveysBadge savedSamples={savedSamples} />
        </IonTabButton>

        <IonTabButton tab="guide" href="/home/guide">
          <IonIcon icon={informationCircleOutline} />
          <IonLabel>
            <T>Guide</T>
          </IonLabel>
        </IonTabButton>

        <IonTabButton tab="species" href="/home/species">
          <IonIcon icon={bookOutline} />
          <IonLabel>
            <T>Species</T>
          </IonLabel>
        </IonTabButton>

        <IonTabButton tab="menu" href="/home/menu">
          <IonIcon icon={menuOutline} />
          <IonLabel>
            <T>Menu</T>
          </IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default observer(HomeController);
