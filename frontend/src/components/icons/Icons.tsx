import styles from './Icon.module.css';
import { createIcon } from './createIcon';
import type { IconProps } from './types';

import ArrowLeftSvg from '../../assets/icons/arrow-left.svg?react';
import ArrowRightSvg from '../../assets/icons/arrow-right.svg?react';
import CalendarSvg from '../../assets/icons/calendar.svg?react';
import CaretLeftSvg from '../../assets/icons/caret-left.svg?react';
import CaretRightSvg from '../../assets/icons/caret-right.svg?react';
import CancelSvg from '../../assets/icons/cancel.svg?react';
import CheckSvg from '../../assets/icons/check.svg?react';
import ConnexionSvg from '../../assets/icons/connexion.svg?react';
import DisconnectSvg from '../../assets/icons/disconnect.svg?react';
import EnergySvg from '../../assets/icons/energy.svg?react';
import EyeSvg from '../../assets/icons/eye.svg?react';
import FlameSvg from '../../assets/icons/flame.svg?react';
import GraphSvg from '../../assets/icons/graph.svg?react';
import HomeSvg from '../../assets/icons/home.svg?react';
import HydratationSvg from '../../assets/icons/hydratation.svg?react';
import LoginSvg from '../../assets/icons/login.svg?react';
import MoonSvg from '../../assets/icons/moon.svg?react';
import NoteSvg from '../../assets/icons/note.svg?react';
import PassSvg from '../../assets/icons/pass.svg?react';
import PencilSvg from '../../assets/icons/pencil.svg?react';
import PlusSvg from '../../assets/icons/plus.svg?react';
import RunSvg from '../../assets/icons/run.svg?react';
import TrashSvg from '../../assets/icons/trash.svg?react';
import ValidSvg from '../../assets/icons/valid.svg?react';
import WeightSvg from '../../assets/icons/weight.svg?react';

export function LogoIcon({ className, size = 44 }: { className?: string; size?: number }) {
  return (
    <img
      src="/assets/icons/logo.svg"
      alt="Diet Tracker"
      className={`${styles.logo} ${className ?? ''}`}
      width={size}
      height={size}
      draggable={false}
    />
  );
}

export const HomeIcon = createIcon(HomeSvg);
export const GraphIcon = createIcon(GraphSvg);
export const LogoutIcon = createIcon(DisconnectSvg);
export const FlameIcon = createIcon(FlameSvg);
export const RunIcon = createIcon(RunSvg);
export const MoonIcon = createIcon(MoonSvg);
export const WaterIcon = createIcon(HydratationSvg);
export const WeightIcon = createIcon(WeightSvg);
export const UserIcon = createIcon(LoginSvg);
export const LockIcon = createIcon(PassSvg);
export const LoginIcon = createIcon(ConnexionSvg);
export const NoteIcon = createIcon(NoteSvg);
export const EnergyIcon = createIcon(EnergySvg);
export const EyeIcon = createIcon(EyeSvg);

export const ChevronLeftIcon = createIcon(CaretLeftSvg);
export const ChevronRightIcon = createIcon(CaretRightSvg);
export const CheckIcon = createIcon(CheckSvg);
export const CancelIcon = createIcon(CancelSvg);
export const EditIcon = createIcon(PencilSvg);
export const TrashIcon = createIcon(TrashSvg);
export const ValidIcon = createIcon(ValidSvg);
export const PlusIcon = createIcon(PlusSvg);
export const CalendarIcon = createIcon(CalendarSvg);
export const ArrowLeftIcon = createIcon(ArrowLeftSvg);
export const ArrowRightIcon = createIcon(ArrowRightSvg);

export type { IconProps };
