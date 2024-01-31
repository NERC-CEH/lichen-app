import {
  byTreeBranchNumber,
  byTreeBranchPart,
  byToleranceType,
} from 'Survey/utils';

type Props = {
  sample: any;
  treeBranchNumber: any;
  treeBranchPart: any;
  type: 'sensitive' | 'tolerant';
};

const ToleranceBadge = ({
  sample,
  treeBranchNumber,
  treeBranchPart,
  type,
}: Props) => {
  const occurrences = sample.occurrences
    .filter(byTreeBranchNumber(treeBranchNumber))
    .filter(byTreeBranchPart(treeBranchPart))
    .filter(byToleranceType(type));

  const value = occurrences.length;

  if (type === 'sensitive') {
    return (
      <span className="inline-flex items-center rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-700/10">
        Sensitive: <div className="ml-1 font-semibold">{value}</div>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md bg-secondary-50 px-2 py-1 text-xs font-medium text-secondary-800 ring-1 ring-inset ring-secondary-600/20">
      Tolerant: <div className="ml-1 font-semibold">{value}</div>
    </span>
  );
};

export default ToleranceBadge;
