import { Page, Main } from '@flumens';
import { IonButton, IonIcon } from '@ionic/react';
import appLogo from './app_logo.png';
import lichenIcon from './lichen.svg';
import './styles.scss';

const HomeController = () => {
  return (
    <Page id="home">
      <Main className="no-padding [--padding-top:env(safe-area-inset-top)]">
        <div className="h-full w-full bg-gradient-to-b from-white via-primary-50 to-primary-100 pt-3">
          <img src={appLogo} alt="" className="m-auto w-full max-w-[80%]" />

          <div className="buttons">
            <IonButton
              className="fancy-button"
              color="light"
              routerLink="/survey"
            >
              <div className="fancy-button-container">
                <div>
                  <h4 className="pb-3">Start survey</h4>
                  Assess nitrogen pollution
                </div>

                <IonIcon src={lichenIcon} />
              </div>
            </IonButton>
          </div>
        </div>
      </Main>
    </Page>
  );
};

export default HomeController;
