import { useState, useEffect } from "react";
import {
  Image,
  Video,
  ExternalLink,
  Eye,
  Play,
  AlertCircle,
} from "lucide-react";
import { getFallbackImageUrl } from "../utils/instagramFetcher";

const MediaThumbnail = ({ item, index, onClick }) => {
  const [thumbnailState, setThumbnailState] = useState("loading"); // 'loading', 'success', 'error', 'fallback'
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  useEffect(() => {
    loadThumbnail();
  }, [item.thumbnail, item.media, item.isVideo, retryCount]);

  const loadThumbnail = async () => {
    setThumbnailState("loading");

    // First try the thumbnail if available
    if (item.thumbnail && retryCount === 0) {
      tryLoadImage(item.thumbnail, "thumbnail");
    }
    // Then try the media URL directly (for images)
    else if (!item.isVideo) {
      const imageUrl =
        retryCount > 0 ? getFallbackImageUrl(item.media) : item.media;
      tryLoadImage(imageUrl, "media");
    }
    // For videos, show fallback immediately
    else {
      setThumbnailState("fallback");
    }
  };

  const tryLoadImage = (url, source) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Check if image actually loaded content (not a broken image)
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setThumbnailUrl(url);
        setThumbnailState("success");
      } else {
        handleImageError(source);
      }
    };

    img.onerror = () => {
      handleImageError(source);
    };

    // Set a timeout for loading
    setTimeout(() => {
      if (thumbnailState === "loading") {
        handleImageError(source);
      }
    }, 5000);

    img.src = url;
  };

  const handleImageError = (source) => {
    if (source === "thumbnail" && item.media && !item.isVideo) {
      // Try loading the media URL directly
      tryLoadImage(item.media, "media");
    } else if (retryCount < maxRetries && !item.isVideo) {
      // Retry with cache-busting
      setRetryCount((prev) => prev + 1);
    } else {
      setThumbnailState("error");
    }
  };

  const renderVideoPreview = () => (
    <div className="relative w-full h-32 bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
      {/* Video preview attempt */}
      {item.thumbnail && thumbnailState !== "error" ? (
        <div className="relative w-full h-full">
          <img
            src={item.thumbnail}
            alt={`Video Preview ${index + 1}`}
            className="w-full h-full object-cover"
            onError={() => setThumbnailState("error")}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white bg-opacity-90 rounded-full p-3 group-hover/thumbnail:scale-110 transition-transform duration-300">
              <Play className="w-8 h-8 text-gray-800 ml-1" />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-red-500 rounded-full p-4 mb-3 group-hover/thumbnail:scale-110 transition-transform duration-300">
            <Video className="w-10 h-10 text-white" />
          </div>
          <p className="text-white font-bold text-sm">Video {index + 1}</p>
          <p className="text-gray-300 text-xs mt-1">Click to view</p>
        </div>
      )}

      {/* Video duration overlay */}
      {item.duration && (
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full font-mono">
          {formatDuration(item.duration)}
        </div>
      )}

      {/* Resolution overlay */}
      {item.width && item.height && (
        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full">
          {item.width}×{item.height}
        </div>
      )}
    </div>
  );

  const renderImagePreview = () => {
    if (thumbnailState === "success" && thumbnailUrl) {
      return (
        <div className="relative w-full h-32">
          <img
            src={thumbnailUrl}
            alt={`Image Preview ${index + 1}`}
            className="w-full h-32 object-cover transition-transform duration-300 group-hover/thumbnail:scale-105"
            onError={() => setThumbnailState("error")}
          />

          {/* Resolution overlay */}
          {item.width && item.height && (
            <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full">
              {item.width}×{item.height}
            </div>
          )}
        </div>
      );
    }

    return renderFallbackCard();
  };

  const renderFallbackCard = () => (
    <div className="relative w-full h-32 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
      {/* Loading state */}
      {thumbnailState === "loading" && (
        <div className="text-center animate-pulse">
          <div className="bg-gray-300 dark:bg-gray-600 rounded-full p-3 mb-2">
            {item.isVideo ? (
              <Video className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            ) : (
              <Image className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading preview...
          </p>
        </div>
      )}

      {/* Error or fallback state */}
      {(thumbnailState === "error" || thumbnailState === "fallback") && (
        <div className="text-center">
          <div
            className={`p-3 rounded-full mb-2 ${
              item.isVideo
                ? "bg-gradient-to-r from-red-500 to-pink-500"
                : "bg-gradient-to-r from-blue-500 to-purple-500"
            } shadow-lg group-hover/thumbnail:scale-110 transition-transform duration-300`}
          >
            {item.isVideo ? (
              <Video className="w-8 h-8 text-white" />
            ) : (
              <Image className="w-8 h-8 text-white" />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {item.isVideo ? "🎬 Video" : "🖼️ Image"} {index + 1}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
              <Eye className="w-3 h-3" />
              Click to view full size
            </p>
          </div>

          {/* Show retry option for failed images */}
          {thumbnailState === "error" &&
            !item.isVideo &&
            retryCount < maxRetries && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRetryCount((prev) => prev + 1);
                }}
                className="mt-2 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                Retry preview
              </button>
            )}
        </div>
      )}

      {/* Quality indicator */}
      {item.width && item.height && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          {item.width}×{item.height}
        </div>
      )}
    </div>
  );

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg cursor-pointer group/thumbnail border-2 border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl"
      onClick={onClick}
      title={`Click to open ${item.isVideo ? "video" : "image"} in full size`}
    >
      {item.isVideo ? renderVideoPreview() : renderImagePreview()}

      {/* Hover overlay with improved visibility */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/thumbnail:bg-opacity-30 transition-all duration-300 flex items-center justify-center rounded-lg">
        <div className="opacity-0 group-hover/thumbnail:opacity-100 transition-all duration-300 bg-white/95 dark:bg-black/90 rounded-lg px-4 py-2 backdrop-blur-sm transform scale-95 group-hover/thumbnail:scale-100">
          <span className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Open {item.isVideo ? "Video" : "Image"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MediaThumbnail;
