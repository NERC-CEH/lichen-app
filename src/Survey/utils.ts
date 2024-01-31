import Sample from 'common/models/sample';
import Occurrence from 'models/occurrence';

export const byTreeBranchNumber =
  (treeBranchNumber: string) => (occ: Occurrence) =>
    occ.attrs.treeBranchNumber === treeBranchNumber;

export const byTreeBranchPart = (treeBranchPart: string) => (occ: Occurrence) =>
  occ.attrs.treeBranchPart === treeBranchPart;

export const byToleranceType =
  (type: 'sensitive' | 'tolerant') => (occ: Occurrence) =>
    occ.attrs.taxon.type === type;

export const byType = (type: 'branch' | 'trunk') => (occ: Occurrence) => {
  const isBranch = ['one', 'two', 'three'].includes(occ.attrs.treeBranchPart);
  return type === 'branch' ? isBranch : !isBranch;
};

export const getTrunkNAQI = (lis: any) =>
  Number.isFinite(lis) ? (3.6666666 - lis) / 3.33333 : -1;

export const getBranchNAQI = (lis: any) =>
  Number.isFinite(lis) ? (3.4 - lis) / 4 : -1;

/**
 * Calculates the Lichen Indicator Index.
 */
export const getLIS = function (type: 'branch' | 'trunk', sample: Sample) {
  const occurrences = sample.occurrences.filter(byType(type));
  if (occurrences.length === 0) return null;

  const trees = new Set();
  const sensitive = new Set();
  const tolerant = new Set();

  const assignToScore = (occ: Occurrence) => {
    const { treeBranchNumber, treeBranchPart, taxon } = occ.attrs;
    const key = `${treeBranchNumber}${treeBranchPart}`;
    trees.add(treeBranchNumber);
    if (taxon.type === 'sensitive') {
      sensitive.add(key);
      return;
    }
    tolerant.add(key);
  };
  occurrences.forEach(assignToScore);

  console.log(type, sensitive.size, tolerant.size, trees.size);

  return (sensitive.size - tolerant.size) / trees.size;
};
