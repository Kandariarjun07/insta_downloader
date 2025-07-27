import {
  Download,
  ExternalLink,
  Image,
  Video,
  CheckCircle,
} from "lucide-react";

const DownloadResult = ({ result }) => {
  if (!result || !result.items || result.items.length === 0) {
    return null;
  }

  const handleDownload = (mediaUrl, filename, isVideo) => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = mediaUrl;
    link.download =
      filename || `instagram_${isVideo ? "video" : "image"}_${Date.now()}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-bounce-in">
      <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-2xl backdrop-blur-sm">
        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse neon-glow">
          <CheckCircle className="w-6 h-6 text-white flex-shrink-0" />
        </div>
        <div>
          <p className="text-green-800 dark:text-green-200 font-bold text-lg">
            🎉 Download Ready!
          </p>
          <p className="text-green-700 dark:text-green-300 text-sm">
            Found{" "}
            <span className="font-semibold gradient-text">
              {result.items.length}
            </span>{" "}
            amazing item
            {result.items.length !== 1 ? "s" : ""} to download ✨
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map((item, index) => (
          <div
            key={index}
            className="card-interactive p-6 hover:shadow-2xl transition-all duration-500 group transform hover:scale-105 animate-scale-in neon-glow"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="space-y-3">
              {/* Media Type Icon */}
              <div className="flex items-center space-x-2">
                {item.isVideo ? (
                  <Video className="w-5 h-5 text-red-500" />
                ) : (
                  <Image className="w-5 h-5 text-blue-500" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.isVideo ? "Video" : "Image"} {index + 1}
                </span>
              </div>

              {/* Preview Thumbnail */}
              <div
                className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer group/thumbnail"
                onClick={() => window.open(item.media, "_blank")}
                title="Click to open full size"
              >
                {item.isVideo ? (
                  // For videos, try to use thumbnail or show video preview
                  <div className="relative">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={`Video Preview ${index + 1}`}
                        className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          // If thumbnail fails, hide image and show video icon
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
                        }}
                      />
                    ) : (
                      // Fallback: try to use the video URL as preview (some browsers can show video thumbnails)
                      <video
                        src={item.media}
                        className="w-full h-32 object-cover"
                        muted
                        preload="metadata"
                        onError={(e) => {
                          // If video preview fails, hide and show icon
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
                        }}
                      />
                    )}

                    {/* Video overlay icon */}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40"
                      style={{ display: item.thumbnail ? "flex" : "none" }}
                    >
                      <div className="bg-white bg-opacity-90 rounded-full p-2">
                        <Video className="w-6 h-6 text-gray-800" />
                      </div>
                    </div>

                    {/* Hover overlay for videos */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/thumbnail:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-lg px-3 py-1">
                        <span className="text-sm font-medium text-gray-800">
                          Click to view
                        </span>
                      </div>
                    </div>

                    {/* Fallback icon if no preview available */}
                    <div
                      className="w-full h-32 flex items-center justify-center bg-gray-200 dark:bg-gray-700"
                      style={{ display: "none" }}
                    >
                      <Video className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                ) : (
                  // For images, use the media URL directly as thumbnail
                  <div className="relative">
                    <img
                      src={item.thumbnail || item.media}
                      alt={`Image Preview ${index + 1}`}
                      className="w-full h-32 object-cover transition-transform duration-300 group-hover/thumbnail:scale-105"
                      onError={(e) => {
                        // If image fails, show fallback icon
                        e.target.style.display = "none";
                        e.target.nextElementSibling.nextElementSibling.style.display =
                          "flex";
                      }}
                    />

                    {/* Hover overlay for images */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/thumbnail:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-lg px-3 py-1">
                        <span className="text-sm font-medium text-gray-800">
                          Click to view
                        </span>
                      </div>
                    </div>

                    {/* Fallback icon if image fails to load */}
                    <div
                      className="w-full h-32 flex items-center justify-center bg-gray-200 dark:bg-gray-700"
                      style={{ display: "none" }}
                    >
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Download Actions */}
              <div className="space-y-3">
                <button
                  onClick={() =>
                    handleDownload(
                      item.media,
                      `instagram_${item.isVideo ? "video" : "image"}_${
                        index + 1
                      }`,
                      item.isVideo
                    )
                  }
                  className="w-full btn-primary flex items-center justify-center space-x-2 group/btn"
                >
                  <Download className="w-5 h-5 group-hover/btn:animate-bounce" />
                  <span className="font-bold">💾 Download</span>
                </button>

                <a
                  href={item.media}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-secondary flex items-center justify-center space-x-2 group/btn"
                >
                  <ExternalLink className="w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-300" />
                  <span className="font-semibold">🔗 Open in New Tab</span>
                </a>
              </div>

              {/* Media Info */}
              {(item.width || item.height || item.duration) && (
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  {item.width && item.height && (
                    <p>
                      Resolution: {item.width} × {item.height}
                    </p>
                  )}
                  {item.duration && (
                    <p>Duration: {Math.round(item.duration)}s</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Source URL(s) */}
      <div className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="font-medium mb-1">
          {result.batchResults ? "Sources:" : "Source:"}
        </p>
        {result.batchResults ? (
          <div className="space-y-2">
            {result.batchResults.map((batchResult, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-gray-400 mt-0.5 flex-shrink-0">
                  {index + 1}.
                </span>
                <a
                  href={batchResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  {batchResult.url}
                </a>
                <span className="text-gray-400 flex-shrink-0">
                  ({batchResult.items.length} item
                  {batchResult.items.length !== 1 ? "s" : ""})
                </span>
              </div>
            ))}
          </div>
        ) : (
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            {result.url}
          </a>
        )}
      </div>
    </div>
  );
};

export default DownloadResult;
