import { useState } from 'react'
import { History, Trash2, Download, ExternalLink, ChevronDown, ChevronUp, Image, Video } from 'lucide-react'

const DownloadHistory = ({ history, onClearHistory }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedItems, setExpandedItems] = useState(new Set())

  if (history.length === 0) {
    return null
  }

  const toggleItemExpansion = (itemId) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleDownload = (mediaUrl, filename, isVideo) => {
    const link = document.createElement('a')
    link.href = mediaUrl
    link.download = filename || `instagram_${isVideo ? 'video' : 'image'}_${Date.now()}`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Download History
          </h2>
          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            {history.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          <button
            onClick={onClearHistory}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Clear history"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {history.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {formatDate(item.timestamp)}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all"
                  >
                    {item.url}
                  </a>
                </div>
                
                <button
                  onClick={() => toggleItemExpansion(item.id)}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {expandedItems.has(item.id) ? 
                    <ChevronUp className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                  }
                </button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                <span>{item.items.length} item{item.items.length !== 1 ? 's' : ''}</span>
                <span className="flex items-center space-x-1">
                  <span>{item.items.filter(i => !i.isVideo).length}</span>
                  <Image className="w-4 h-4" />
                </span>
                <span className="flex items-center space-x-1">
                  <span>{item.items.filter(i => i.isVideo).length}</span>
                  <Video className="w-4 h-4" />
                </span>
              </div>

              {expandedItems.has(item.id) && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {item.items.map((media, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        {media.isVideo ? (
                          <Video className="w-4 h-4 text-red-500" />
                        ) : (
                          <Image className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {media.isVideo ? 'Video' : 'Image'} {index + 1}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDownload(
                            media.media,
                            `instagram_${media.isVideo ? 'video' : 'image'}_${index + 1}`,
                            media.isVideo
                          )}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        
                        <a
                          href={media.media}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DownloadHistory
