import type { Transition, Variants } from 'motion/react';

/** iOS navigation curve (UIKit push/pop feel) */
export const IOS_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

export const pushTransition: Transition = { type: 'tween', ease: IOS_EASE, duration: 0.46 };
export const sheetSpring: Transition = { type: 'spring', stiffness: 420, damping: 40, mass: 0.9 };
export const softSpring: Transition = { type: 'spring', stiffness: 500, damping: 34 };
export const popSpring: Transition = { type: 'spring', stiffness: 600, damping: 26 };

/** Stagger children on screen entrance */
export const listContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 32 } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: IOS_EASE } },
};
