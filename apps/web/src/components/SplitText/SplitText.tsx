import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
} from 'react';
import { useReveal } from '@/hooks/useReveal';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './SplitText.module.scss';

export interface SplitTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  immediate?: boolean;
  /** Extra delay applied on top of the per-line stagger. */
  startIndex?: number;
  /** Forwarded so headings can be referenced by aria-labelledby. */
  id?: string;
}

/**
 * Headline reveal, split by RENDERED LINE.
 *
 * Splitting by word would be far easier, but the brief asks for lines, and
 * lines are the only split that reads as typography rather than as an effect.
 * There is no way to know where a line breaks without laying the text out, so
 * this renders once with each word wrapped, reads the words' offsetTop to group
 * them into lines, then re-renders those lines inside overflow-hidden masks.
 *
 * Re-measures when the text changes (locale switch), when the box resizes, and
 * after webfonts load — Cormorant and the Noto Armenian faces all change the
 * metrics enough to move the breaks.
 *
 * Under reduced motion it never splits at all: the text renders once, plainly,
 * and fades in.
 */
export function SplitText({
  text,
  as: Tag = 'span',
  className,
  immediate = false,
  startIndex = 0,
  id,
}: SplitTextProps) {
  const reduced = useReducedMotion();
  const hostRef = useRef<HTMLElement | null>(null);
  const [lines, setLines] = useState<string[] | null>(null);
  const { ref: revealRef, revealed } = useReveal<HTMLElement>({ immediate, threshold: 0.2 });

  const words = text.split(/\s+/).filter(Boolean);

  // Re-measure whenever the text changes (locale switch). Adjusted during
  // render rather than in an effect — an effect would render one frame of the
  // old lines under the new text.
  const [lastText, setLastText] = useState(text);
  if (text !== lastText) {
    setLastText(text);
    setLines(null);
  }

  useLayoutEffect(() => {
    if (reduced || lines !== null) return;
    const host = hostRef.current;
    if (!host) return;

    const measure = (): void => {
      const spans = host.querySelectorAll<HTMLElement>('[data-word]');
      if (spans.length === 0) return;

      const grouped: string[] = [];
      let currentTop: number | null = null;
      let current: string[] = [];

      spans.forEach((span) => {
        const top = span.offsetTop;
        // Sub-pixel and baseline jitter: treat anything within 4px as the
        // same line rather than splitting on rounding noise.
        if (currentTop === null || Math.abs(top - currentTop) < 4) {
          currentTop = currentTop ?? top;
          current.push(span.dataset['word'] ?? '');
        } else {
          grouped.push(current.join(' '));
          current = [span.dataset['word'] ?? ''];
          currentTop = top;
        }
      });
      if (current.length > 0) grouped.push(current.join(' '));
      setLines(grouped);
    };

    // Webfonts change the metrics; measure after they settle.
    if (document.fonts?.status === 'loaded') {
      measure();
    } else {
      void document.fonts?.ready.then(measure).catch(() => measure());
    }
  }, [lines, reduced, text]);

  // A width change can re-break the lines — drop back to measuring.
  useEffect(() => {
    if (reduced) return;
    const host = hostRef.current;
    if (!host || typeof ResizeObserver === 'undefined') return;

    let last = host.offsetWidth;
    const ro = new ResizeObserver(() => {
      if (Math.abs(host.offsetWidth - last) < 2) return;
      last = host.offsetWidth;
      setLines(null);
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, [reduced]);

  // Reduced motion: no split, no transform. Just the text, fading in.
  if (reduced) {
    return (
      <Tag
        ref={revealRef}
        id={id}
        className={`${styles.root} ${className ?? ''}`}
        data-revealed={revealed}
      >
        {text}
      </Tag>
    );
  }

  // Measuring pass — real layout, hidden from view, and from screen readers
  // (the final pass carries the accessible text).
  if (lines === null) {
    return (
      <Tag
        ref={hostRef}
        id={id}
        className={`${styles.root} ${styles.measuring} ${className ?? ''}`}
        aria-hidden="true"
      >
        {words.map((w, i) => (
          <span key={`${w}-${i}`} className={styles.word} data-word={w}>
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        hostRef.current = node;
        revealRef.current = node;
      }}
      id={id}
      className={`${styles.root} ${className ?? ''}`}
      data-revealed={revealed}
    >
      {/* One accessible copy of the sentence; the visual lines are decorative
          so a screen reader does not read it line-by-line as fragments. */}
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true">
        {lines.map((line, i) => (
          <span key={`${line}-${i}`} className={styles.line}>
            <span
              className={styles.inner}
              style={{ '--line-index': startIndex + i } as CSSProperties}
            >
              {line}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
