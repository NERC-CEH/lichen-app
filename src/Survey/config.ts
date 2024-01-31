import {
  calendarOutline,
  clipboardOutline,
  mailOpenOutline,
} from 'ionicons/icons';
import * as Yup from 'yup';
import {
  PageProps,
  RemoteConfig,
  date as DateHelp,
  MenuAttrItemFromModelMenuProps,
} from '@flumens';
import AppOccurrence, { Taxon } from 'models/occurrence';
import AppSample from 'models/sample';
import treeIcon from './tree.svg';
import { byType, getBranchNAQI, getLIS, getTrunkNAQI } from './utils';

const fixedLocationSchema = Yup.object().shape({
  latitude: Yup.number().required(),
  longitude: Yup.number().required(),
  name: Yup.string().required(),
});

const validateLocation = (val: any) => {
  try {
    fixedLocationSchema.validateSync(val);
    return true;
  } catch (e) {
    return false;
  }
};

export const verifyLocationSchema = Yup.mixed().test(
  'location',
  'Please enter location and its name.',
  validateLocation
);

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

const treeTypeValues = [
  {
    id: 5202,
    value: 'birch',
    label: 'Birch',
  },
  {
    id: 5203,
    value: 'oak',
    label: 'Oak',
  },
];

const circumferenceProps = {
  menuProps: {
    label: 'Circumference',
    icon: treeIcon,
  },
  pageProps: {
    headerProps: {
      title: 'Circumference',
    },
    attrProps: {
      input: 'input',
      inputProps: {
        type: 'number',
      },
      info: 'Enter tree circumference in centimetres.',
    },
  },
};

const survey: Survey = {
  id: 307,
  name: 'default',
  label: 'Survey',

  attrs: {
    email: {
      menuProps: {
        label: 'Email (optional)',
        icon: mailOpenOutline,
        skipValueTranslation: true,
      },
      pageProps: {
        headerProps: {
          title: 'Email',
        },
        attrProps: {
          input: 'input',
          info: 'Please enter your email.',
        },
      },
      remote: { id: 623 },
    },

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

    date: {
      menuProps: {
        icon: calendarOutline,
        parse: 'date',
      },
      pageProps: {
        attrProps: {
          input: 'date',
          inputProps: { max: () => new Date() },
        },
      },
      remote: {
        values: (date: any) => DateHelp.print(date, false),
      },
    },

    locationName: locationNameAttr,

    comment: {
      menuProps: {
        label: 'Comment',
        icon: clipboardOutline,
        skipValueTranslation: true,
      },
      pageProps: {
        headerProps: {
          title: 'Comment',
        },
        attrProps: {
          input: 'textarea',
          info: 'Please add any extra info about this record.',
        },
      },
    },

    treeType: {
      menuProps: {
        label: 'Tree type',
        icon: treeIcon,
      },
      pageProps: {
        attrProps: {
          input: 'radio',
          inputProps: { options: treeTypeValues },
        },
      },
      remote: {
        id: 621,
        values: treeTypeValues,
      },
    },

    trunkNAQI: { remote: { id: 613 } },
    branchNAQI: { remote: { id: 619 } },
    trunkLIS: { remote: { id: 620 } },
    branchLIS: { remote: { id: 612 } },

    treeCircumference1: { ...circumferenceProps, remote: { id: 618 } },
    treeCircumference2: { ...circumferenceProps, remote: { id: 617 } },
    treeCircumference3: { ...circumferenceProps, remote: { id: 616 } },
    treeCircumference4: { ...circumferenceProps, remote: { id: 615 } },
    treeCircumference5: { ...circumferenceProps, remote: { id: 614 } },
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
        attrs: {
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

  verify(attrs: any, sample: AppSample) {
    try {
      Yup.object()
        .shape({
          treeType: Yup.string().required('Tree type cannot be empty.'),
        })
        .validateSync(attrs, { abortEarly: false });

      Yup.number()
        .min(1, 'Lichen species are missing.')
        .validateSync(sample.occurrences.length, { abortEarly: false });

      const trunks = sample.occurrences
        .filter(byType('trunk'))
        .map((occ: AppOccurrence) => occ.attrs.treeBranchNumber);

      const uniqueTrunks = Array.from(new Set(trunks));
      uniqueTrunks.forEach((trunkId: string) => {
        console.log(
          `treeCircumference${trunkId}`,
          (sample.attrs as any)[`treeCircumference${trunkId}`]
        );

        Yup.number()
          .min(0, `Tree ${trunkId} circumference is missing.`)
          .validateSync(
            (sample.attrs as any)[`treeCircumference${trunkId}`] || -1,
            { abortEarly: false }
          );
      });
    } catch (attrError) {
      return attrError;
    }

    return null;
  },

  async create({ Sample }) {
    const sample = new Sample({
      metadata: {
        survey_id: survey.id,
        survey: survey.name,
      },

      attrs: {
        training: 't', // TODO:
        date: new Date().toISOString(),
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
