import { ReactNode } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { Button } from '@flumens';

interface Props {
  children: ReactNode;
  onClick: any;
  isInvalid?: boolean;
  className?: string;
}

const HeaderButton = ({ children, onClick, isInvalid, className }: Props) => {
  return (
    <Button
      onPress={onClick}
      color={!isInvalid ? 'secondary' : 'primary'}
      className={clsx(
        'max-w-28 whitespace-nowrap px-4 py-1 text-base',
        !isInvalid && 'bg-secondary-500',
        isInvalid && 'opacity-50',
        className
      )}
    >
      {children}
    </Button>
  );
};

export default observer(HeaderButton);
