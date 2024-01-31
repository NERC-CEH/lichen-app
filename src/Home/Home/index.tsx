import { Page, Main } from '@flumens';
import { IonButton, IonIcon } from '@ionic/react';
import lichenIcon from './lichen.svg';
import './styles.scss';

const HomeController = () => {
  return (
    <Page id="home">
      <Main>
        <h1 className="mx-auto block w-fit bg-primary-200 p-5">
          WIP: app logo
        </h1>

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
      </Main>
    </Page>
  );
};

export default HomeController;
