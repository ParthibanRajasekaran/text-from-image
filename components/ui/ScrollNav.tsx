import * as React from 'react';
import clsx from 'clsx';

export type ScrollNavSection = { id: string; label: string };

const HEADER_OFFSET = 96;       // sticky header height + spacing
const RESUME_AFTER_MS = 600;    // pause spy after click to avoid flicker

export function ScrollNav({ sections }: { sections: ScrollNavSection[] }) {
  const [activeId, setActiveId] = React.useState<string>(sections[0]?.id);
  const suspendRef = React.useRef(false);
  const timer = React.useRef<number>();

  // Make anchor targets stop below sticky header
  React.useEffect(() => {
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) (el.style as any).scrollMarginTop = `${HEADER_OFFSET + 8}px`;
    });
  }, [sections]);

  // One active section at a time using IntersectionObserver
  React.useEffect(() => {
    const targets = sections
      .map(s => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];
    if (!targets.length) return;

    const io = new IntersectionObserver(
      entries => {
        if (suspendRef.current) return;
        const inView = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = inView[0]?.target as HTMLElement | undefined;
        if (top && top.id !== activeId) setActiveId(top.id);
      },
      { root: null, rootMargin: `-${HEADER_OFFSET}px 0px -55% 0px`, threshold: [0.15, 0.55, 0.8] }
    );

    targets.forEach(t => io.observe(t));
    return () => io.disconnect();
  }, [sections, activeId]);

  const onClick = (id: string) => (_e: React.MouseEvent) => {
    setActiveId(id);                      // immediate feedback
    suspendRef.current = true;            // pause spy while smooth scroll happens
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => (suspendRef.current = false), RESUME_AFTER_MS);
  };

  return (
    <nav
      aria-label="On this page"
      className="rounded-2xl p-3 border border-border/40 bg-background/40 backdrop-blur-xl"
    >
      <p className="px-2 pb-2 text-xs text-muted-foreground">On this page</p>
      <ul className="space-y-1">
        {sections.map(s => {
          const isActive = s.id === activeId;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={onClick(s.id)}
                aria-current={isActive ? 'location' : undefined}
                className={clsx(
                  'group relative block rounded-xl px-3 py-2 transition outline-none',
                  'text-foreground/80 hover:text-foreground',
                  // focus: ring only (no filled background)
                  'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                )}
              >
                {/* active marker: slim accent bar */}
                <span
                  aria-hidden="true"
                  className={clsx(
                    'absolute left-1 top-1/2 -translate-y-1/2 h-5 w-1.5 rounded-full transition-opacity',
                    isActive ? 'opacity-100 bg-accent' : 'opacity-0'
                  )}
                />
                {/* hover/focus wash for glass theme */}
                <span
                  aria-hidden="true"
                  className={clsx(
                    'absolute inset-0 rounded-xl pointer-events-none opacity-0 transition',
                    'group-hover:opacity-100 group-focus-visible:opacity-100',
                    'bg-accent/15 dark:bg-accent/20'
                  )}
                />
                <span className={clsx('relative z-10 font-medium', isActive && 'text-accent')}>
                  {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
