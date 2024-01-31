import {
  Occurrence as OccurrenceOriginal,
  OccurrenceAttrs,
  OccurrenceMetadata,
  validateRemoteModel,
} from '@flumens';
import { Survey } from 'Survey/config';
import Sample from './sample';

export type Taxon = {
  id: string;
  warehouse_id: number;
  type: 'sensitive' | 'tolerant';
  taxon: string;
  description: string;
  profile_pic: string;
  growth_form: 'granular' | 'bushy' | 'leafy';
};

type Attrs = Omit<OccurrenceAttrs, 'taxon'> & {
  taxon: Taxon;
  treeBranchNumber: '1' | '2' | '3' | '4' | '5';
  treeBranchPart: 'east' | 'south' | 'west' | 'one' | 'two' | 'three';
};

type Metadata = OccurrenceMetadata;

export default class Occurrence extends OccurrenceOriginal<Attrs, Metadata> {
  static fromJSON(json: any) {
    return super.fromJSON(json);
  }

  declare parent?: Sample;

  declare getSurvey: () => Survey;

  getPrettyName() {
    return this.attrs.taxon?.taxon;
  }

  validateRemote = validateRemoteModel;
}
