import type { FC, SVGProps } from 'react';
import styles from './Icon.module.css';
import type { IconProps } from './types';

export function createIcon(Svg: FC<SVGProps<SVGSVGElement>>) {
  return function Icon({ className, size = 20 }: IconProps) {
    return (
      <Svg
        className={`${styles.icon} ${className ?? ''}`}
        width={size}
        height={size}
        aria-hidden
      />
    );
  };
}
