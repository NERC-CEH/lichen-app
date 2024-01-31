import { observer } from 'mobx-react';
import { Page, PickByType } from '@flumens';
import appModel, { Attrs as AppModelAttrs } from 'models/app';
import Main from './Main';

function onToggle(
  setting: keyof PickByType<AppModelAttrs, boolean>,
  checked: boolean
) {
  appModel.attrs[setting] = checked;
  appModel.save();
}

const Controller = () => {
  const { sendAnalytics } = appModel.attrs;

  const onToggleWrap = (setting: any, checked: boolean) =>
    onToggle(setting, checked);

  return (
    <Page id="home-menu">
      <Main sendAnalytics={sendAnalytics} onToggle={onToggleWrap} />
    </Page>
  );
};

export default observer(Controller);
