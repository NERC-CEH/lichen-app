import { mailOpenOutline } from 'ionicons/icons';
import { z, object } from 'zod';
import {
  PageProps,
  RemoteConfig,
  MenuAttrItemFromModelMenuProps,
} from '@flumens';
import { IonIcon } from '@ionic/react';
import AppOccurrence, { Taxon } from 'models/occurrence';
import AppSample from 'models/sample';
import tree from './tree.svg';
import { getBranchNAQI, getLIS, getTrunkNAQI } from './utils';

export const locationNameAttr = {
  remote: { id: 'location_name' },
};

export const locationAttr = {
  remote: {
    id: 'entered_sref',
    values(location: any, submission: any) {
      // convert accuracy for map and gridref sources
      const { accuracy, source, gridref, altitude, name, altitudeAccuracy } =
        location;

      // add other location related attributes
      // eslint-disable-next-line
      submission.values = { ...submission.values };

      if (source) submission.values['smpAttr:760'] = source; // eslint-disable-line
      if (gridref) submission.values['smpAttr:335'] = gridref; // eslint-disable-line

      submission.values['smpAttr:282'] = accuracy; // eslint-disable-line
      submission.values['smpAttr:283'] = altitude; // eslint-disable-line
      submission.values['smpAttr:284'] = altitudeAccuracy; // eslint-disable-line
      submission.values['location_name'] = name; // eslint-disable-line

      const lat = parseFloat(location.latitude);
      const lon = parseFloat(location.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lat)) return null;

      return `${lat.toFixed(7)}, ${lon.toFixed(7)}`;
    },
  },
};

type MenuProps = MenuAttrItemFromModelMenuProps & { attrProps?: any };

export type AttrConfig = {
  menuProps?: MenuProps;
  pageProps?: Omit<PageProps, 'attr' | 'model'>;
  remote?: RemoteConfig;
};

interface Attrs {
  [key: string]: AttrConfig;
}

type OccurrenceConfig = {
  render?: any[] | ((model: AppOccurrence) => any[]);
  attrs: Attrs;
  create?: (props: {
    Occurrence: typeof AppOccurrence;
    taxon: Taxon;
    treeBranchPart?: string;
    treeBranchNumber?: string;
  }) => AppOccurrence;
  verify?: (attrs: any) => any;
  modifySubmission?: (submission: any, model: any) => any;
  /**
   * Set to true if multi-species surveys shouldn't auto-increment it to 1 when adding to lists.
   */
  skipAutoIncrement?: boolean;
};

export type SampleConfig = {
  attrs?: Attrs;
  create?: (props: {
    Sample: typeof AppSample;
    Occurrence: typeof AppOccurrence;
    taxon: Taxon;
  }) => Promise<AppSample>;
  verify?: (attrs: any, sample: AppSample) => any;
  modifySubmission?: (submission: any, model: any) => any;
  smp?: SampleConfig;
  occ?: OccurrenceConfig;
};

export interface Survey extends SampleConfig {
  /**
   * Remote warehouse survey ID.
   */
  id: number;
  /**
   * In-App survey code name.
   */
  name: string;
  /**
   * Pretty survey name to show in the UI.
   */
  label?: string;
  /**
   * Which species group this config belongs to. Allows to link multiple taxon groups together under a common name.
   */
  taxa?: string;

  create: (props: {
    Sample: typeof AppSample;
    Occurrence?: typeof AppOccurrence;
    taxon?: Taxon;
  }) => Promise<AppSample>;
}

const mailIcon = (<IonIcon src={mailOpenOutline} className="size-6" />) as any;

export const emailAttr = {
  id: 'smpAttr:623',
  type: 'textInput',
  prefix: mailIcon,
  title: 'Email (optional)',
} as const;

const treeIcon = (<IonIcon src={tree} className="size-6" />) as any;

export const treeTypeAttr = {
  id: 'smpAttr:621',
  type: 'choiceInput',
  title: 'Tree type',
  prefix: treeIcon,
  appearance: 'button',
  choices: [
    { title: 'Birch', dataName: '5202' },
    { title: 'Oak', dataName: '5203' },
  ],
} as const;

export const commentAttr = {
  id: 'comment',
  type: 'textInput',
  title: 'Comments',
  appearance: 'multiline',
} as const;

const circumferenceProps = {
  title: 'Circumference',
  type: 'numberInput',
  appearance: 'counter',
  prefix: treeIcon,
  suffix: 'cm',
  validations: { min: 1 },
};

export const treeCircumference1Attr = {
  ...circumferenceProps,
  id: 'smpAttr:618',
};
export const treeCircumference2Attr = {
  ...circumferenceProps,
  id: 'smpAttr:617',
};
export const treeCircumference3Attr = {
  ...circumferenceProps,
  id: 'smpAttr:616',
};
export const treeCircumference4Attr = {
  ...circumferenceProps,
  id: 'smpAttr:615',
};
export const treeCircumference5Attr = {
  ...circumferenceProps,
  id: 'smpAttr:614',
};

const survey: Survey = {
  id: 307,
  name: 'default',
  label: 'Survey',

  attrs: {
    location: {
      remote: {
        id: 'entered_sref',
        values(location, submission) {
          const { accuracy, altitude, altitudeAccuracy } = location;

          submission.values['smpAttr:282'] = accuracy; // eslint-disable-line
          submission.values['smpAttr:283'] = altitude; // eslint-disable-line
          submission.values['smpAttr:284'] = altitudeAccuracy; // eslint-disable-line

          return `${parseFloat(location.latitude).toFixed(7)}, ${parseFloat(
            location.longitude
          ).toFixed(7)}`;
        },
      },
    },

    locationName: locationNameAttr,

    trunkNAQI: { remote: { id: 613 } },
    branchNAQI: { remote: { id: 619 } },
    trunkLIS: { remote: { id: 620 } },
    branchLIS: { remote: { id: 612 } },
  },

  occ: {
    attrs: {
      taxon: {
        remote: {
          id: 'taxa_taxon_list_id',
          values: (taxon: Taxon) => taxon.warehouse_id,
        },
      },

      treeBranchNumber: {
        remote: {
          id: 425,
          values: [
            { id: 5208, value: '1' },
            { id: 5209, value: '2' },
            { id: 5210, value: '3' },
            { id: 5211, value: '4' },
            { id: 5212, value: '5' },
          ],
        },
      },

      treeBranchPart: {
        remote: {
          id: 426,
          values: [
            // trunk sides
            { id: 5213, value: 'east' },
            { id: 5214, value: 'south' },
            { id: 5215, value: 'west' },
            // branch zones
            { id: 5216, value: 'one' },
            { id: 5217, value: 'two' },
            { id: 5218, value: 'three' },
          ],
        },
      },
    },

    create({ Occurrence, taxon, treeBranchPart, treeBranchNumber }) {
      return new Occurrence({
        data: {
          taxon,
          treeBranchPart,
          treeBranchNumber,
        },
      });
    },

    verify() {
      return null;
    },
  },

  verify: attrs =>
    object({
      date: z.string(),
      [treeTypeAttr.id]: z.string({
        required_error: 'Tree type cannot be empty.',
      }),
    }).safeParse(attrs).error,
  // TODO:
  // verify(attrs: any, sample: AppSample) {

  //     Yup.number()
  //       .min(1, 'Lichen species are missing.')
  //       .validateSync(sample.occurrences.length, { abortEarly: false });

  //     const trunks = sample.occurrences
  //       .filter(byType('trunk'))
  //       .map((occ: AppOccurrence) => occ.data.treeBranchNumber);

  //     const uniqueTrunks = Array.from(new Set(trunks));
  //     uniqueTrunks.forEach((trunkId: string) => {
  //       console.log(
  //         `treeCircumference${trunkId}`,
  //         (sample.attrs as any)[`treeCircumference${trunkId}`]
  //       );

  //       Yup.number()
  //         .min(0, `Tree ${trunkId} circumference is missing.`)
  //         .validateSync(
  //           (sample.attrs as any)[`treeCircumference${trunkId}`] || -1,
  //           { abortEarly: false }
  //         );
  //     });
  //   } catch (attrError) {
  //     return attrError;
  //   }

  //   return null;
  // },

  async create({ Sample }) {
    const sample = new Sample({
      data: {
        surveyId: survey.id,
        date: new Date().toISOString(),
        enteredSrefSystem: 4326,
        location: {},
      },
    });

    sample.startGPS();

    return sample;
  },

  modifySubmission(submission: any, sample: AppSample) {
    const trunkLIS: any = getLIS('trunk', sample);
    const hasTrunkResults = Number.isFinite(trunkLIS);
    if (hasTrunkResults) {
      const trunkNAQI = getTrunkNAQI(trunkLIS);
      // eslint-disable-next-line
      submission.values[
        `smpAttr:${survey.attrs!.trunkNAQI.remote!.id as any}`
      ] = trunkNAQI;

      // eslint-disable-next-line
      submission.values[`smpAttr:${survey.attrs!.trunkLIS.remote!.id as any}`] =
        trunkLIS;
    }

    const branchLIS: any = getLIS('branch', sample);
    const hasBranchResults = Number.isFinite(branchLIS);
    if (hasBranchResults) {
      const branchNAQI = getBranchNAQI(branchLIS);
      // eslint-disable-next-line
      submission.values[
        `smpAttr:${survey.attrs!.branchNAQI.remote!.id as any}`
      ] = branchNAQI;

      // eslint-disable-next-line
      submission.values[
        `smpAttr:${survey.attrs!.branchLIS.remote!.id as any}`
      ] = branchLIS;
    }

    return submission;
  },
};

export default survey;
