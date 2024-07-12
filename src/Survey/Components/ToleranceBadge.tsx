import { Badge } from 'common/flumens';
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

  const value = `${occurrences.length}`;

  if (type === 'sensitive') {
    return (
      <Badge className="bg-primary-100 text-primary-800 ring-primary-700/20">
        Sensitive: <span className="ml-1 font-semibold">{value}</span>
      </Badge>
    );
  }

  return (
    <Badge className="bg-secondary-100 text-secondary-800 ring-secondary-600/20">
      Tolerant: <span className="ml-1 font-semibold">{value}</span>
    </Badge>
  );
};

export default ToleranceBadge;
