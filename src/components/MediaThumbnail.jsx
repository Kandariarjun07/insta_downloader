import { useState, useEffect } from 'react';
import { Image, Video, ExternalLink, Eye } from 'lucide-react';

const MediaThumbnail = ({ item, index, onClick }) => {
  const [thumbnailState, setThumbnailState] = useState('loading'); // 'loading', 'success', 'error'
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  useEffect(() => {
    // Try to load thumbnail if available
    if (item.thumbnail) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setThumbnailUrl(item.thumbnail);
        setThumbnailState('success');
      };
      img.onerror = () => {
        setThumbnailState('error');
      };
      img.src = item.thumbnail;
    } else if (!item.isVideo) {
      // For images, try to load the media URL directly
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setThumbnailUrl(item.media);
        setThumbnailState('success');
      };
      img.onerror = () => {
        setThumbnailState('error');
      };
      img.src = item.media;
    } else {
      setThumbnailState('error');
    }
  }, [item.thumbnail, item.media, item.isVideo]);

  const renderFallbackCard = () => (
    <div className="relative w-full h-32 flex flex-col items-center justify-center p-4">
      {/* Media Type Icon */}
      <div className={`p-3 rounded-full mb-2 ${
        item.isVideo 
          ? 'bg-gradient-to-r from-red-500 to-pink-500' 
          : 'bg-gradient-to-r from-blue-500 to-purple-500'
      } shadow-lg animate-pulse`}>
        {item.isVideo ? (
          <Video className="w-8 h-8 text-white" />
        ) : (
          <Image className="w-8 h-8 text-white" />
        )}
      </div>
      
      {/* Media Info */}
      <div className="text-center">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
          {item.isVideo ? '🎬 Video' : '🖼️ Image'} {index + 1}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
          <Eye className="w-3 h-3" />
          Click to view
        </p>
      </div>

      {/* Quality indicator */}
      {item.width && item.height && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          {item.width}×{item.height}
        </div>
      )}

      {/* Duration for videos */}
      {item.isVideo && item.duration && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          {Math.round(item.duration)}s
        </div>
      )}
    </div>
  );

  const renderThumbnailImage = () => (
    <div className="relative w-full h-32">
      <img
        src={thumbnailUrl}
        alt={`${item.isVideo ? 'Video' : 'Image'} Preview ${index + 1}`}
        className="w-full h-32 object-cover transition-transform duration-300 group-hover/thumbnail:scale-105"
        onError={() => setThumbnailState('error')}
      />
      
      {/* Video overlay icon */}
      {item.isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white bg-opacity-90 rounded-full p-2">
            <Video className="w-6 h-6 text-gray-800" />
          </div>
        </div>
      )}

      {/* Quality indicator */}
      {item.width && item.height && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          {item.width}×{item.height}
        </div>
      )}

      {/* Duration for videos */}
      {item.isVideo && item.duration && (
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          {Math.round(item.duration)}s
        </div>
      )}
    </div>
  );

  return (
    <div
      className="relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 cursor-pointer group/thumbnail border-2 border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300"
      onClick={onClick}
      title="Click to open full size"
    >
      {thumbnailState === 'success' && thumbnailUrl ? renderThumbnailImage() : renderFallbackCard()}
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/thumbnail:bg-opacity-20 transition-all duration-300 flex items-center justify-center rounded-lg">
        <div className="opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-black/90 rounded-lg px-3 py-2 backdrop-blur-sm">
          <span className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Open {item.isVideo ? 'Video' : 'Image'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MediaThumbnail;
