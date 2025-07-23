import { observer } from 'mobx-react';
import {
  informationCircleOutline,
  heartCircleOutline,
  lockClosedOutline,
  shareOutline,
  openOutline,
  warningOutline,
  exitOutline,
  personAddOutline,
  personOutline,
  cloudDownloadOutline,
  cloudUploadOutline,
  personRemoveOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Main, InfoMessage, Toggle, useAlert } from '@flumens';
import {
  IonIcon,
  IonList,
  IonItem,
  IonButton,
  isPlatform,
  IonLabel,
} from '@ionic/react';
import CONFIG from 'common/config';
import { UserModel } from 'common/models/user';

function useUserDeleteDialog(deleteUser: any) {
  const alert = useAlert();

  const showUserDeleteDialog = () => {
    alert({
      header: 'Account delete',
      message: (
        <T>
          Are you sure you want to delete your account?
          <InfoMessage
            color="danger"
            prefix={<IonIcon src={warningOutline} />}
            skipTranslation
          >
            This will remove your account on the{' '}
            <b>{{ url: CONFIG.backend.url.replace('https://', '') } as any}</b>{' '}
            website. You will lose access to any records that you have
            previously submitted using the app or website.
          </InfoMessage>
        </T>
      ),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: deleteUser,
        },
      ],
    });
  };

  return showUserDeleteDialog;
}

function useDatabaseExportDialog(exportFn: any) {
  const alert = useAlert();

  const showDatabaseExportDialog = () => {
    alert({
      header: 'Export',
      message: (
        <T>
          Are you sure you want to export the data?
          <p className="my-2 font-bold">
            This feature is intended solely for technical support and is not a
            supported method for exporting your data
          </p>
        </T>
      ),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Export',
          handler: exportFn,
        },
      ],
    });
  };

  return showDatabaseExportDialog;
}

type Props = {
  sendAnalytics: boolean;
  onToggle: (sendAnalytics: string, checked: boolean) => void;
  logOut: () => void;
  refreshAccount: any;
  exportDatabase: any;
  importDatabase: any;
  deleteUser: any;
  resendVerificationEmail: () => Promise<void>;
  isLoggedIn: boolean;
  user: UserModel;
};

const MenuMain = ({
  isLoggedIn,
  user,
  logOut,
  refreshAccount,
  resendVerificationEmail,
  sendAnalytics,
  onToggle,
  exportDatabase,
  importDatabase,
  deleteUser,
}: Props) => {
  const isNotVerified = user.data.verified === false; // verified is undefined in old versions
  const userEmail = user.data.email;
  const showDatabaseExportDialog = useDatabaseExportDialog(exportDatabase);
  const showUserDeleteDialog = useUserDeleteDialog(deleteUser);

  const onSendAnalyticsToggle = (checked: boolean) =>
    onToggle('sendAnalytics', checked);

  return (
    <Main className="[--padding-top:env(safe-area-inset-top)]">
      <h1 className="my-6 text-center text-3xl font-semibold">Menu</h1>

      <IonList lines="full">
        <h2 className="list-title">Account</h2>
        <div className="rounded-list">
          {isLoggedIn && (
            <IonItem detail id="logout-button" onClick={logOut}>
              <IonIcon icon={exitOutline} size="small" slot="start" />
              Logout
              {': '}
              {user.data.firstName} {user.data.lastName}
            </IonItem>
          )}

          {isLoggedIn && isNotVerified && (
            <InfoMessage className="verification-warning">
              Looks like your <b>{{ userEmail } as any}</b> email hasn't been
              verified yet.
              <div>
                <IonButton fill="outline" onClick={refreshAccount}>
                  Refresh
                </IonButton>
                <IonButton fill="clear" onClick={resendVerificationEmail}>
                  Resend Email
                </IonButton>
              </div>
            </InfoMessage>
          )}

          {!isLoggedIn && (
            <IonItem routerLink="/user/login" detail>
              <IonIcon icon={personOutline} size="small" slot="start" />
              Login
            </IonItem>
          )}

          {!isLoggedIn && (
            <IonItem routerLink="/user/register" detail>
              <IonIcon icon={personAddOutline} size="small" slot="start" />
              Register
            </IonItem>
          )}
        </div>

        <h2 className="list-title">Info</h2>
        <div className="rounded-list">
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

        <h2 className="list-title">Settings</h2>
        <div className="rounded-list">
          <Toggle
            prefix={<IonIcon src={shareOutline} className="size-6" />}
            label="Share App Analytics"
            defaultSelected={sendAnalytics}
            onChange={onSendAnalyticsToggle}
          />
          <InfoMessage inline>
            Share app crash data so we can make the app more reliable.
          </InfoMessage>
          <IonItem onClick={showDatabaseExportDialog}>
            <IonIcon icon={cloudDownloadOutline} size="small" slot="start" />
            <T>Export database</T>
          </IonItem>
          {!isPlatform('hybrid') && (
            <IonItem onClick={importDatabase}>
              <IonIcon icon={cloudUploadOutline} size="small" slot="start" />
              Import database
            </IonItem>
          )}
        </div>

        <div className="rounded-list mt-4">
          {isLoggedIn && (
            <>
              <IonItem onClick={showUserDeleteDialog} className="!text-danger">
                <IonIcon icon={personRemoveOutline} size="small" slot="start" />
                <IonLabel>
                  <T>Delete account</T>
                </IonLabel>
              </IonItem>
              <InfoMessage inline>
                You can delete your user account from the system.
              </InfoMessage>
            </>
          )}
        </div>

        <div className="my-10 text-center opacity-50">
          <p>App version: {`v${CONFIG.version} (${CONFIG.build})`}</p>
        </div>
      </IonList>
    </Main>
  );
};

export default observer(MenuMain);
