/* eslint-disable @getify/proper-arrows/name */
import clsx from 'clsx';
import 'swiper/css';
import 'swiper/css/pagination';
import { Gallery, useOnHideModal } from '@flumens';
import '@ionic/react/css/ionic-swiper.css';

// import '../styles.scss';

export type Image = { src: string };

type Props = {
  photos: Image[];
  onClose: () => void;
  isOpen?: number;
};

const FullScreenPhotoViewer = ({ photos, onClose, isOpen }: Props) => {
  const items: any = photos;
  let initialSlide = 0;
  let className = 'white-background';

  useOnHideModal(onClose);

  const swiperProps: any = {};

  if (Number.isInteger(isOpen)) {
    initialSlide = isOpen || 0;
    className = '';
  }

  return (
    <Gallery
      isOpen={!!items.length && Number.isInteger(isOpen)}
      items={items}
      initialSlide={initialSlide}
      onClose={onClose}
      className={clsx('fullscreen-photo-viewer', className)}
      mode="md"
      swiperProps={swiperProps}
    />
  );
};

export default FullScreenPhotoViewer;
