import { calendarOutline } from 'ionicons/icons';
import {
  IonDatetime,
  IonDatetimeButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
} from '@ionic/react';
import { Sample } from 'common/flumens';

type Props = { model: Sample };

const MenuDateAttr = ({ model }: Props) => {
  return (
    <IonItem className="m-0 rounded-none [--border-radius:0] [--border-style:solid] [--inner-padding-end:8px]">
      <IonIcon src={calendarOutline} slot="start" />
      <IonLabel className="!opacity-100">Survey time</IonLabel>
      <div className="flex items-center gap-1">
        <div>
          <IonDatetimeButton
            datetime="surveyEndTime"
            slot="end"
            className="[--ion-color-step-300:rgba(var(--color-tertiary-800-rgb),0.04)] [--ion-text-color:var(--form-value-color)]"
          />
          <IonModal keepContentsMounted className="[--border-radius:10px]">
            <IonDatetime
              id="surveyEndTime"
              presentation="date"
              preferWheel
              onIonChange={(e: any) => {
                // eslint-disable-next-line
                (model.attrs as any).date = e.detail.value.split('T')[0];
              }}
              value={(model.attrs as any).date}
              disabled={model.isDisabled()}
              max={new Date().toISOString()}
            />
          </IonModal>
        </div>
      </div>
    </IonItem>
  );
};

export default MenuDateAttr;
