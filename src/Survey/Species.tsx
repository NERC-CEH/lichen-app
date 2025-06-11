import { useContext } from 'react';
import { useRouteMatch } from 'react-router';
import { Header, Main, Page } from '@flumens';
import { NavContext } from '@ionic/react';
import SpeciesList from 'common/Components/SpeciesList';
import Occurrence, { Taxon } from 'common/models/occurrence';
import Sample from 'common/models/sample';
import HeaderButton from './Components/HeaderButton';
import survey from './config';
import { byTreeBranchNumber, byTreeBranchPart } from './utils';

const getNextLink = (match: any) => {
  const nav = match.url.includes('trunk')
    ? ['east', 'south', 'west']
    : ['one', 'two', 'three'];
  const url = match.url.split('/');
  const current = url.pop() as string;
  const index = nav.indexOf(current);
  const link = nav[index + 1];
  if (!link) return '';

  return `${url.join('/')}/${link}`;
};

type Props = { sample: Sample };

const Species = ({ sample }: Props) => {
  const navigator = useContext(NavContext);
  const match = useRouteMatch<{
    treeBranchNumber: string;
    treeBranchPart: string;
  }>();

  const nextLink = getNextLink(match);

  const { treeBranchNumber, treeBranchPart } = match.params;

  const {isDisabled} = sample;

  const occurrences = sample.occurrences
    .filter(byTreeBranchNumber(treeBranchNumber))
    .filter(byTreeBranchPart(treeBranchPart));

  const changeSpeciesSelection = (taxon: Taxon, op: 'add' | 'remove') => {
    if (op === 'add') {
      const newOccurrence = survey.occ!.create!({
        Occurrence,
        taxon,
        treeBranchPart,
        treeBranchNumber,
      });

      sample.occurrences.push(newOccurrence);
      sample.save();
      return;
    }

    if (op === 'remove') {
      const byTaxonIdAndPart = (occ: Occurrence) =>
        occ.data.taxon.id === taxon.id &&
        occ.data.treeBranchNumber === treeBranchNumber &&
        occ.data.treeBranchPart === treeBranchPart;
      const occToDelete = sample.occurrences.find(byTaxonIdAndPart);
      console.log(occToDelete);

      occToDelete?.destroy();
    }
  };

  const getTaxon = (occ: Occurrence) => occ.data.taxon;
  const selectedSpecies = occurrences.map(getTaxon);

  const navigateNext = () =>
    !nextLink
      ? navigator.goBack()
      : navigator.navigate(nextLink, 'forward', 'replace');

  const nextButton = (
    <HeaderButton onClick={navigateNext}>
      {nextLink ? 'Next' : 'Finish'}
    </HeaderButton>
  );

  return (
    <Page id="survey-species">
      <Header
        title={treeBranchPart}
        className="capitalize"
        rightSlot={nextButton}
      />
      <Main>
        <SpeciesList
          value={selectedSpecies}
          onChange={changeSpeciesSelection}
          disabled={isDisabled}
        />
      </Main>
    </Page>
  );
};

export default Species;
