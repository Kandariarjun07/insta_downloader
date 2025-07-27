const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const renderCardSkeleton = () => (
    <div className="card p-4 animate-pulse">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        </div>
        
        <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        
        <div className="space-y-2">
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        </div>
        
        <div className="space-y-1">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )

  const renderListSkeleton = () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
          </div>
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
        </div>
      </div>
    </div>
  )

  const renderInputSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
      <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-64"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-56"></div>
      </div>
    </div>
  )

  const skeletons = Array.from({ length: count }, (_, index) => {
    switch (type) {
      case 'card':
        return <div key={index}>{renderCardSkeleton()}</div>
      case 'list':
        return <div key={index}>{renderListSkeleton()}</div>
      case 'input':
        return <div key={index}>{renderInputSkeleton()}</div>
      default:
        return <div key={index}>{renderCardSkeleton()}</div>
    }
  })

  if (type === 'card' && count > 1) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skeletons}
      </div>
    )
  }

  if (type === 'list' && count > 1) {
    return (
      <div className="space-y-4">
        {skeletons}
      </div>
    )
  }

  return skeletons[0]
}

export default LoadingSkeleton
