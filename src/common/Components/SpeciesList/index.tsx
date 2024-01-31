import { useState } from 'react';
import { IonCheckbox, IonList } from '@ionic/react';
import { Taxon } from 'common/models/occurrence';
import GuideItemProfile from './GuideItemProfile';
import './images';
import species from './species.json';

const byGrowthForm = (form: 'granular' | 'bushy' | 'leafy') => (taxon: Taxon) =>
  taxon.growth_form === form;

const byName = (taxon1: Taxon, taxon2: Taxon) =>
  taxon1.taxon.localeCompare(taxon2.taxon);

type Props = {
  value?: Taxon[];
  onChange?: (newValue: Taxon, op: 'add' | 'remove') => void;
  disabled?: boolean;
};

const SpeciesList = ({ value, onChange, disabled }: Props) => {
  const [profile, setProfile] = useState<Taxon | null>();

  const getItem = (sp: Taxon) => {
    const speciesInfo = (
      <div className="flex items-center whitespace-normal">{sp.taxon}</div>
    );

    const speciesPhoto = (
      <div
        className="h-24 w-24 shrink-0 bg-slate-200"
        onClick={(e: any) => {
          e.preventDefault();
          e.stopPropagation();
          setProfile(sp);
        }}
      >
        <img
          src={`/images/${sp.profile_pic}`}
          alt=""
          className="h-full w-full border-r object-cover"
        />
      </div>
    );

    if (onChange) {
      const byId = (taxon: Taxon) => taxon.id === sp.id;
      const checked = !!value?.find(byId);

      const onCheckboxValueChanged = (ev: any) => {
        if (disabled) return;
        onChange(sp, ev.detail.checked ? 'add' : 'remove');
      };

      return (
        <div
          key={sp.id}
          className="my-3 flex gap-4 overflow-hidden rounded-md bg-white pr-2 opacity-100 shadow-sm"
        >
          {speciesPhoto}

          <IonCheckbox
            className="flex w-full pr-2 opacity-100"
            value={sp}
            onIonChange={onCheckboxValueChanged}
            checked={checked}
            disabled={disabled}
          >
            {speciesInfo}
          </IonCheckbox>
        </div>
      );
    }

    return (
      <div
        className="my-3 flex gap-4 overflow-hidden rounded-md bg-white pr-2 shadow-sm"
        key={sp.id}
        onClick={() => setProfile(sp)}
      >
        {speciesPhoto}
        {speciesInfo}
      </div>
    );
  };

  const bushySpecies = (species as any)
    .filter(byGrowthForm('bushy'))
    .sort(byName)
    .map(getItem);

  const leafySpecies = (species as any)
    .filter(byGrowthForm('leafy'))
    .sort(byName)
    .map(getItem);

  const granularSpecies = (species as any)
    .filter(byGrowthForm('granular'))
    .sort(byName)
    .map(getItem);

  return (
    <>
      <IonList className="mt-3">
        <div className="rounded-md bg-primary-100 px-3 py-1 text-sm text-primary-800 ring-1 ring-inset ring-primary-700/10">
          Bushy
        </div>
        {bushySpecies}

        <div className="rounded-md bg-primary-100 px-3 py-1 text-sm text-primary-800 ring-1 ring-inset ring-primary-700/10">
          Leafy
        </div>
        {leafySpecies}

        <div className="rounded-md bg-primary-100 px-3 py-1 text-sm text-primary-800 ring-1 ring-inset ring-primary-700/10">
          Granular
        </div>
        {granularSpecies}
      </IonList>

      <GuideItemProfile item={profile} onClose={() => setProfile(null)} />
    </>
  );
};

export default SpeciesList;
