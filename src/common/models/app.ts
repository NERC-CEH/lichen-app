import { Model, ModelAttrs } from '@flumens';
import { mainStore } from './store';

export interface Attrs extends ModelAttrs {
  appSession: number;
  sendAnalytics: boolean;
  useTraining: boolean;
  draftId: string;
}

const defaults: Attrs = {
  sendAnalytics: true,
  useTraining: false,
  appSession: 0,
  draftId: '',
};

class AppModel extends Model<Attrs> {
  constructor(options: any) {
    super({ ...options, data: { ...defaults, ...options.data } });
  }
}

const appModel = new AppModel({ cid: 'app', store: mainStore });

export { appModel as default, AppModel };
