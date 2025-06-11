import { observer } from 'mobx-react';
import { Page, PickByType, useAlert, useLoader, useToast } from '@flumens';
import savedSamples from 'common/models/collections/samples';
import userModel, { useUserStatusCheck } from 'common/models/user';
import appModel, { Attrs as AppModelAttrs } from 'models/app';
import Main from './Main';

const useConfirmationDialog = () => {
  const alert = useAlert();

  const logoutAlert = (callback: any) => {
    alert({
      header: 'Logout',
      message: (
        <>
          Are you sure you want to logout?
          <br />
          <br />
          Your pending and uploaded <b>records will not be deleted</b> from this
          device.
        </>
      ),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Logout',
          cssClass: 'primary',
          handler: () => callback(),
        },
      ],
    });
  };

  return logoutAlert;
};

function onToggle(
  setting: keyof PickByType<AppModelAttrs, boolean>,
  checked: boolean
) {
  appModel.data[setting] = checked;
  appModel.save();
}

const Controller = () => {
  const { sendAnalytics } = appModel.data;

  const showLogoutConfirmationDialog = useConfirmationDialog();
  const toast = useToast();
  const loader = useLoader();
  const checkUserStatus = useUserStatusCheck();

  const isLoggedIn = userModel.isLoggedIn();

  const resendVerificationEmail = async () => {
    if (!isLoggedIn) {
      toast.warn('Please log in first.');
      return;
    }

    await loader.show('Please wait...');

    try {
      await userModel.resendVerificationEmail();
      toast.success(
        'A new verification email was successfully sent now. If you did not receive the email, then check your Spam or Junk email folders.',
        { duration: 5000 }
      );
    } catch (e: any) {
      toast.error(e.message);
    }

    loader.hide();
  };

  function logOut() {
    console.log('Info:Menu: logging out.');
    const resetWrap = async (reset: boolean) => {
      if (reset) {
        await savedSamples.resetDefaults();
      }

      userModel.logOut();
    };

    showLogoutConfirmationDialog(resetWrap);
  }

  const onToggleWrap = (setting: any, checked: boolean) =>
    onToggle(setting, checked);

  return (
    <Page id="home-menu">
      <Main
        sendAnalytics={sendAnalytics}
        onToggle={onToggleWrap}
        user={userModel}
        isLoggedIn={isLoggedIn}
        logOut={logOut}
        refreshAccount={checkUserStatus}
        resendVerificationEmail={resendVerificationEmail}
      />
    </Page>
  );
};

export default observer(Controller);
