import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useReveal } from '@/hooks/useReveal';
import styles from './Reveal.module.scss';

export interface RevealProps {
  children: ReactNode;
  /** Sibling position — drives the 60ms stagger. */
  index?: number;
  as?: ElementType;
  className?: string;
  /** Above-the-fold content should not wait for a scroll. */
  immediate?: boolean;
  threshold?: number;
  style?: CSSProperties;
}

/**
 * Rise-and-fade on scroll. The animation itself is CSS; this only decides when
 * to flip `data-revealed`, which is why reduced motion cannot be forgotten —
 * the cascade drops the transform and the stagger on its own.
 */
export function Reveal({
  children,
  index = 0,
  as: Tag = 'div',
  className,
  immediate = false,
  threshold,
  style,
}: RevealProps) {
  const { ref, revealed } = useReveal<HTMLElement>({
    immediate,
    ...(threshold !== undefined ? { threshold } : {}),
  });

  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${className ?? ''}`}
      data-revealed={revealed}
      style={{ ...style, '--reveal-index': index } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
