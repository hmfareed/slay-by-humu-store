// components/HomePageSkeleton.tsx

export default function HomePageSkeleton() {
  return (
    <div className="relative font-sans bg-brand-bg text-brand-text min-h-screen">

      {/* ─── SKELETON HEADER ─── */}
      <header className="sticky top-0 z-50 bg-brand-bg border-b border-brand-text/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          {/* Logo + icons row */}
          <div className="flex items-center justify-between py-5">
            {/* Logo placeholder */}
            <div className="skeleton-shimmer rounded-md h-9 w-48" />
            {/* Icon placeholders */}
            <div className="flex items-center gap-6">
              <div className="skeleton-shimmer rounded-full h-5 w-5" />
              <div className="skeleton-shimmer rounded-full h-5 w-5" />
            </div>
          </div>
          {/* Search bar placeholder */}
          <div className="pb-5">
            <div className="skeleton-shimmer rounded-full h-11 w-full" />
          </div>
        </div>
      </header>

      {/* ─── SKELETON HERO ─── */}
      <section
        className="relative w-full overflow-hidden bg-brand-panel skeleton-shimmer"
        style={{ height: 'clamp(300px, 60vh, 600px)' }}
      >
        {/* Bottom text overlay skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 flex flex-col gap-3">
          <div className="skeleton-shimmer-light rounded h-3 w-24" />
          <div className="skeleton-shimmer-light rounded-lg h-10 w-72 max-w-full" />
          <div className="skeleton-shimmer-light rounded-lg h-8 w-48 max-w-full" />
          <div className="flex items-center gap-4 mt-1">
            <div className="skeleton-shimmer-light rounded h-6 w-20" />
            <div className="skeleton-shimmer-light rounded-full h-11 w-36" />
          </div>
        </div>
      </section>

      {/* ─── SKELETON CATEGORY PILLS ─── */}
      <section className="py-10 md:py-14 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-10 flex flex-col items-center gap-3">
          <div className="skeleton-shimmer rounded-lg h-8 w-56" />
          <div className="skeleton-shimmer rounded h-4 w-72 max-w-full" />
        </div>
        {/* Category pill cards */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-shimmer rounded-2xl"
              style={{ width: 140, height: 110 }}
            />
          ))}
        </div>
      </section>

      {/* ─── SKELETON PRODUCT GRID (two category rows) ─── */}
      {Array.from({ length: 2 }).map((_, catIdx) => (
        <section
          key={catIdx}
          className="py-12 md:py-16 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto"
        >
          {/* Category heading row */}
          <div className="flex items-end justify-between mb-10">
            <div className="flex flex-col gap-2">
              <div className="skeleton-shimmer rounded h-3 w-24" />
              <div className="skeleton-shimmer rounded-lg h-8 w-48" />
            </div>
            <div className="hidden md:block skeleton-shimmer rounded h-4 w-20" />
          </div>

          {/* Product cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                {/* Product image */}
                <div className="skeleton-shimmer rounded-2xl aspect-[3/4] w-full" />
                {/* Product name */}
                <div className="flex flex-col items-center gap-2">
                  <div className="skeleton-shimmer rounded h-4 w-3/4" />
                  <div className="skeleton-shimmer rounded h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          {catIdx < 1 && (
            <div className="mt-12 md:mt-16 border-t border-brand-text/5" />
          )}
        </section>
      ))}
    </div>
  );
}
