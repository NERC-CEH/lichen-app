import { Main, Page } from '@flumens';
import SpeciesList from 'common/Components/SpeciesList';

const Species = () => (
  <Page id="species-guide">
    <Main className="[--padding-top:env(safe-area-inset-top)]">
      <h1 className="my-6 text-center text-3xl font-semibold">
        Lichen species
      </h1>

      <SpeciesList />
    </Main>
  </Page>
);

export default Species;
