# Recipes

Imports assume `motion/react`. Swap to `framer-motion` if that's the installed package.

## Section reveal on scroll (the workhorse)

```jsx
const reveal = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}
<motion.section variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} />
```

## Staggered grid

```jsx
<motion.div
  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, amount: 0.2 }}
  className="grid grid-cols-3 gap-6"
>
  {items.map((i) => (
    <motion.article
      key={i.id}
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
    />
  ))}
</motion.div>
```

## Modal / dialog

```jsx
<AnimatePresence>
  {open && (
    <>
      <motion.div
        key="ov"
        className="fixed inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={close}
      />
      <motion.div
        key="panel"
        role="dialog"
        aria-modal
        className="fixed inset-0 m-auto h-fit w-[min(90vw,32rem)]"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
        exit={{ opacity: 0, scale: 0.98, y: 4, transition: { duration: 0.15, ease: 'easeIn' } }}
      />
    </>
  )}
</AnimatePresence>
```

## Bottom sheet / drawer (draggable to dismiss)

```jsx
<motion.div
  drag="y"
  dragConstraints={{ top: 0, bottom: 0 }}
  dragElastic={{ top: 0, bottom: 0.5 }}
  onDragEnd={(_, info) => {
    if (info.offset.y > 120 || info.velocity.y > 500) close();
  }}
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  transition={{ type: 'spring', stiffness: 400, damping: 40 }}
/>
```

## Accordion (height without animating height)

```jsx
<AnimatePresence initial={false}>
  {open && (
    <motion.div
      key="c"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ overflow: 'hidden' }}
    >
      <div className="pb-6">{children}</div>
    </motion.div>
  )}
</AnimatePresence>
```

(`height: auto` is the one layout property Motion handles well. Keep padding on the inner div so it doesn't fight the collapse.)

## Page transition — Next.js App Router

```jsx
'use client';
import { usePathname } from 'next/navigation';
export function PageTransition({ children }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
```

## Shared element (grid card → detail)

```jsx
<motion.div layoutId={`card-${id}`}>
  <motion.h3 layoutId={`title-${id}`}>{title}</motion.h3>
  <motion.img layoutId={`img-${id}`} src={src} />
</motion.div>
```

Same `layoutId` values on the detail view; wrap both in `<LayoutGroup>` if they're siblings in one tree.

## Text reveal (word by word)

```jsx
const words = text.split(" ")
<motion.p variants={{ show: { transition: { staggerChildren: 0.03 } } }} initial="hidden" whileInView="show" viewport={{ once: true }}>
  {words.map((w, i) => (
    <span key={i} style={{ display: "inline-block", overflow: "hidden" }}>
      <motion.span style={{ display: "inline-block" }}
        variants={{ hidden: { y: "100%" }, show: { y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }}>
        {w}&nbsp;
      </motion.span>
    </span>
  ))}
</motion.p>
```

## Image reveal (mask wipe)

```jsx
<motion.div
  style={{ overflow: 'hidden' }}
  initial={{ clipPath: 'inset(0 0 100% 0)' }}
  whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
  viewport={{ once: true }}
  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
>
  <motion.img
    initial={{ scale: 1.15 }}
    whileInView={{ scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
  />
</motion.div>
```

## Magnetic button

```jsx
const x = useMotionValue(0), y = useMotionValue(0)
const sx = useSpring(x, { stiffness: 300, damping: 20 }), sy = useSpring(y, { stiffness: 300, damping: 20 })
<motion.button style={{ x: sx, y: sy }}
  onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.25); y.set((e.clientY - r.top - r.height / 2) * 0.25) }}
  onPointerLeave={() => { x.set(0); y.set(0) }} />
```

## Infinite marquee

```jsx
<motion.div
  className="flex gap-8 w-max"
  animate={{ x: ['0%', '-50%'] }}
  transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
>
  {[...items, ...items].map((i, k) => (
    <div key={k}>{i}</div>
  ))}
</motion.div>
```

## Header that hides on scroll down

```jsx
const { scrollY } = useScroll()
const [hidden, setHidden] = useState(false)
useMotionValueEvent(scrollY, "change", v => setHidden(v > scrollY.getPrevious() && v > 120))
<motion.header animate={{ y: hidden ? "-100%" : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} />
```

## Number counter

```jsx
const mv = useMotionValue(0)
const rounded = useTransform(mv, v => Math.round(v))
useEffect(() => { const c = animate(mv, target, { duration: 1.4, ease: "easeOut" }); return c.stop }, [target])
<motion.span>{rounded}</motion.span>
```
