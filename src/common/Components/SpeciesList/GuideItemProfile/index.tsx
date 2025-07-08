/* eslint-disable @getify/proper-arrows/name */
import { useState } from 'react';
import { arrowBack } from 'ionicons/icons';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Badge, Main, useOnBackButton } from '@flumens';
import {
  IonCardHeader,
  IonButton,
  IonCardContent,
  IonIcon,
  IonButtons,
  IonHeader,
  IonModal,
  IonToolbar,
} from '@ionic/react';
import '@ionic/react/css/ionic-swiper.css';
import { Taxon } from 'common/models/occurrence';
import FullScreenPhotoViewer from './FullScreenPhotoViewer';
import './styles.scss';

type Props = {
  onClose: any;
  item?: Taxon | null;
};

const GuideItemProfile = ({ item, onClose }: Props) => {
  const [showGallery, setShowGallery] = useState<number>();

  useOnBackButton(onClose);

  const showPhotoInFullScreen = (index: number) => setShowGallery(index);

  const images = [`/images/${item?.profile_pic}`];

  const getSlides = () => {
    const slideOpts = {
      initialSlide: 0,
      speed: 400,
    };

    const getSlide = (imageURL: string, index: number) => {
      const showPhotoInFullScreenWrap = () => showPhotoInFullScreen(index);

      return (
        <SwiperSlide
          key={imageURL}
          onClick={showPhotoInFullScreenWrap}
          className="item-profile-photo"
        >
          <img src={imageURL} />
        </SwiperSlide>
      );
    };

    const slideImage = images.map(getSlide);

    return (
      <Swiper modules={[Pagination]} pagination {...slideOpts}>
        {slideImage}
      </Swiper>
    );
  };

  if (!item) return null;

  const onGalleryClose = () => setShowGallery(undefined);

  const itemPhotos = images.map((src: any) => ({ src }));

  return (
    <>
      <IonModal
        id="item-profile"
        isOpen={!!item}
        backdropDismiss={false}
        mode="md"
      >
        <IonHeader className="item-modal-header">
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                onClick={onClose}
                fill="solid"
                color="light"
                shape="round"
              >
                <IonIcon slot="icon-only" icon={arrowBack} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <Main className="no-ion-padding">
          {getSlides()}

          <IonCardHeader>
            <h1 className="m-0 italic text-primary-800">{item.taxon}</h1>
          </IonCardHeader>

          <IonCardContent>
            <div className="my-4">
              <div className="heading inline text-base text-primary">
                Description:
              </div>
              <p className="!mt-2">{item.description}</p>
            </div>

            <div className="my-4">
              <div className="heading inline text-base text-primary">
                Growth form:
              </div>{' '}
              <Badge className="capitalize">{item.growth_form}</Badge>
            </div>

            <div className="my-4">
              <div className="heading inline text-base text-primary">
                Nitrogen:
              </div>{' '}
              {item.type === 'sensitive' ? (
                <Badge className="bg-secondary-100 text-secondary-800 ring-secondary-600/20">
                  Sensitive
                </Badge>
              ) : (
                <Badge className="bg-primary-100 text-primary-800 ring-primary-700/20">
                  Tolerant
                </Badge>
              )}
            </div>

            {!!item.chemical_test && (
              <div className="my-4">
                <div className="heading inline text-base text-primary">
                  Chemical test:
                </div>{' '}
                <Badge className="inline-block translate-y-1 first-letter:capitalize">
                  {item.chemical_test}
                </Badge>
              </div>
            )}
          </IonCardContent>
        </Main>
      </IonModal>

      <FullScreenPhotoViewer
        photos={itemPhotos}
        onClose={onGalleryClose}
        isOpen={showGallery}
      />
    </>
  );
};

export default GuideItemProfile;
