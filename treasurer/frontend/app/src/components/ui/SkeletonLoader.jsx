/**
 * @param {{ width?: string, height?: string, variant?: 'line'|'card'|'circle', className?: string }} props
 */
export default function SkeletonLoader({ width = 'w-full', height = 'h-4', variant = 'line', className = '' }) {
  const baseClass = 'shimmer-bg animate-pulse';

  if (variant === 'circle') {
    return (
      <div className={`${baseClass} rounded-full ${width} ${height} bg-white/5 ${className}`} />
    );
  }

  if (variant === 'card') {
    return (
      <div className={`${baseClass} rounded-xl ${width} ${height} bg-white/5 ${className}`} />
    );
  }

  return (
    <div className={`${baseClass} rounded-md ${width} ${height} bg-white/5 ${className}`} />
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonLoader width="w-24" height="h-4" />
        <SkeletonLoader width="w-10" height="h-10" variant="circle" />
      </div>
      <SkeletonLoader width="w-32" height="h-8" />
      <SkeletonLoader width="w-20" height="h-3" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl p-5 space-y-4">
      <SkeletonLoader width="w-32" height="h-5" />
      <div className="flex items-center justify-center">
        <SkeletonLoader width="w-48" height="h-48" variant="circle" />
      </div>
      <div className="space-y-2 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <SkeletonLoader width="w-24" height="h-3" />
            <SkeletonLoader width="w-16" height="h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl p-5 space-y-4">
      <SkeletonLoader width="w-40" height="h-5" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <SkeletonLoader width="w-16" height="h-3" />
            <SkeletonLoader width="w-24" height="h-3" />
            <SkeletonLoader width="w-20" height="h-3" />
            <SkeletonLoader width="w-16" height="h-3" />
            <SkeletonLoader width="w-16" height="h-6" variant="card" />
          </div>
        ))}
      </div>
    </div>
  );
}
