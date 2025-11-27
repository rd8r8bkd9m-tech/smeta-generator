import clsx from 'clsx'

export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'shimmer' | 'none'
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'shimmer',
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  }

  const animationStyles = {
    pulse: 'animate-pulse bg-gray-200 dark:bg-gray-700',
    shimmer: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]',
    none: 'bg-gray-200 dark:bg-gray-700',
  }

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height || (variant === 'text' ? '1em' : undefined),
  }

  return (
    <div
      className={clsx(
        'block',
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={style}
    />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={clsx('p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm', className)}>
      <div className="flex items-start space-x-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-3">
          <Skeleton width="60%" height={20} />
          <Skeleton width="80%" height={16} />
          <div className="flex space-x-2">
            <Skeleton width={60} height={24} variant="rounded" />
            <Skeleton width={80} height={24} variant="rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex space-x-4">
        <Skeleton width="30%" height={16} />
        <Skeleton width="20%" height={16} />
        <Skeleton width="15%" height={16} />
        <Skeleton width="20%" height={16} />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-4 flex space-x-4 border-t border-gray-100 dark:border-gray-700">
          <Skeleton width="30%" height={14} />
          <Skeleton width="20%" height={14} />
          <Skeleton width="15%" height={14} />
          <Skeleton width="20%" height={14} />
        </div>
      ))}
    </div>
  )
}

export default Skeleton
