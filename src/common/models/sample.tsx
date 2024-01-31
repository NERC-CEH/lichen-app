/* eslint-disable max-classes-per-file */

/* eslint-disable no-param-reassign */
import { IObservableArray } from 'mobx';
import { useTranslation } from 'react-i18next';
import {
  Sample as SampleOriginal,
  SampleAttrs,
  SampleOptions,
  SampleMetadata,
  ModelValidationMessage,
  device,
  useAlert,
} from '@flumens';
import config from 'common/config';
import defaultSurvey, { Survey } from 'Survey/config';
import Occurrence from './occurrence';
import GPSExtension from './sampleGPSExt';
import { modelStore } from './store';

type Attrs = SampleAttrs & {
  location?: any;
  activity?: any;

  treeCircumference1?: number;
  treeCircumference2?: number;
  treeCircumference3?: number;
  treeCircumference4?: number;
  treeCircumference5?: number;
};

type Metadata = SampleMetadata & {
  saved?: boolean;
};

export default class Sample extends SampleOriginal<Attrs, Metadata> {
  static fromJSON(json: any) {
    return super.fromJSON(json, Occurrence, Sample);
  }

  declare occurrences: IObservableArray<Occurrence>;

  declare samples: IObservableArray<Sample>;

  declare parent?: Sample;

  declare survey: typeof defaultSurvey;

  startGPS: any; // from extension

  isGPSRunning: any; // from extension

  stopGPS: any; // from extension

  gps: any; // from extension

  constructor({
    isSubSample,
    ...options
  }: SampleOptions & { isSubSample?: boolean }) {
    // only top samples should have the store, otherwise sync() will save sub-samples on attr change.
    const store = isSubSample ? undefined : modelStore; // eventually remove this once using a SubSample class.

    super({ ...options, store });

    this.remote.url = `${config.backend.indicia.url}/index.php/services/rest`;
    // eslint-disable-next-line
    this.remote.headers = async () => ({
      Authorization: `Bearer ${config.backend.indicia.anonToken}`,
    });

    this.survey = defaultSurvey;

    Object.assign(this, GPSExtension());
  }

  cleanUp() {
    this.stopGPS();

    const stopGPS = (smp: Sample) => {
      smp.stopGPS();
    };
    this.samples.forEach(stopGPS);
  }

  async upload() {
    if (this.remote.synchronising || this.isUploaded()) return true;

    const invalids = this.validateRemote();
    if (invalids) return false;

    if (!device.isOnline) return false;

    this.cleanUp();

    return this.saveRemote();
  }

  getSurvey(): Survey {
    return this.survey as Survey;
  }

  async destroy(silent?: boolean) {
    this.cleanUp();
    return super.destroy(silent);
  }
}

export const useValidateCheck = (sample: Sample) => {
  const alert = useAlert();
  const { t } = useTranslation();

  const showValidateCheck = () => {
    const invalids = sample.validateRemote();
    if (invalids) {
      alert({
        header: t('Survey incomplete'),
        skipTranslation: true,
        message: <ModelValidationMessage {...invalids} />,
        buttons: [
          {
            text: t('Got it'),
            role: 'cancel',
          },
        ],
      });
      return false;
    }
    return true;
  };

  return showValidateCheck;
};
