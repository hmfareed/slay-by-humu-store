'use client';

import { ReactLenis } from '@studio-freight/react-lenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    // @ts-ignore - Lenis typing mismatch with React 19
    <ReactLenis options={{ lerp: 0.05, duration: 1.5, smoothWheel: true }}>
      {children as any}
    </ReactLenis>
  );
}
