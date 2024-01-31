import { Main, Page } from '@flumens';
import SpeciesList from 'common/Components/SpeciesList';

const Species = () => (
  <Page id="species-guide">
    <Main>
      <h1 className="text-center">Lichen species</h1>

      <SpeciesList />
    </Main>
  </Page>
);

export default Species;
