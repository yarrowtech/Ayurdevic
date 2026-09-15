// Shimmering placeholder block for content that's still loading.
export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`skeleton rounded ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3 rounded-md border border-gray-500/20 bg-white p-3 sm:p-4">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-4/5" />
      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}
