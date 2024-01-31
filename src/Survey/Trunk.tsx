import { useContext } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Page, Header, Main, MenuAttrItemFromModel } from '@flumens';
import { IonButton, IonItem, IonList, NavContext } from '@ionic/react';
import Sample from 'models/sample';
import ToleranceBadge from './Components/ToleranceBadge';

const getNextLink = (match: any) => {
  const url = match.url.split('/');
  const currentIndex = Number.parseInt(url.pop() as string, 10);
  if (currentIndex === 5) return '';
  return `${url.join('/')}/${currentIndex + 1}`;
};

type Props = { sample: Sample };

const Trunk = ({ sample }: Props) => {
  const navigator = useContext(NavContext);

  const match = useRouteMatch<{ treeBranchNumber: string }>();
  const { treeBranchNumber } = match.params;

  const nextLink = getNextLink(match);

  const links = ['east', 'south', 'west'].map((treeBranchPart: string) => (
    <IonItem
      routerLink={`${match.url}/part/${treeBranchPart}`}
      detail={false}
      key={treeBranchPart}
    >
      <div className="flex w-full gap-2">
        <div className="capitalize">{treeBranchPart}</div>
        <div className="flex w-full justify-end gap-2">
          <ToleranceBadge
            type="sensitive"
            sample={sample}
            treeBranchNumber={treeBranchNumber}
            treeBranchPart={treeBranchPart}
          />
          <ToleranceBadge
            type="tolerant"
            sample={sample}
            treeBranchNumber={treeBranchNumber}
            treeBranchPart={treeBranchPart}
          />
        </div>
      </div>
    </IonItem>
  ));

  const navigateNext = () =>
    !nextLink
      ? navigator.goBack()
      : navigator.navigate(nextLink, 'forward', 'replace');

  const nextButton = (
    <IonButton
      className="rounded-md bg-secondary-400 px-3"
      onClick={navigateNext}
    >
      {nextLink ? 'Next' : 'Finish'}
    </IonButton>
  );

  return (
    <Page id="survey-trunk">
      <Header title={`Trunk ${treeBranchNumber}`} rightSlot={nextButton} />
      <Main>
        <IonList className="mt-2">
          <div className="rounded">
            <MenuAttrItemFromModel
              model={sample}
              attr={`treeCircumference${treeBranchNumber}`}
            />
          </div>
        </IonList>
        <IonList className="mt-2">
          <div className="rounded">{links}</div>
        </IonList>
      </Main>
    </Page>
  );
};

export default Trunk;
