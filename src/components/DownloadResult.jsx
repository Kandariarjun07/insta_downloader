import { useState } from "react";
import {
  Download,
  ExternalLink,
  Image,
  Video,
  CheckCircle,
  Package,
  Archive,
} from "lucide-react";
import {
  downloadAsZip,
  shouldOfferZipDownload,
  estimateZipSize,
} from "../utils/zipDownload";
import ZipDownloadProgress from "./ZipDownloadProgress";
import MediaThumbnail from "./MediaThumbnail";

const DownloadResult = ({ result }) => {
  const [zipProgress, setZipProgress] = useState({
    isVisible: false,
    progress: 0,
    total: 0,
    status: "idle", // 'idle', 'downloading', 'creating', 'success', 'error'
    message: "",
    estimatedSize: "",
  });
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

  const handleZipDownload = async () => {
    const estimatedSize = estimateZipSize(result.items);

    setZipProgress({
      isVisible: true,
      progress: 0,
      total: result.items.length,
      status: "downloading",
      message: "Starting download...",
      estimatedSize,
    });

    try {
      console.log("Starting ZIP download for items:", result.items);

      const zipResult = await downloadAsZip(
        result.items,
        `instagram_${result.batchResults ? "batch" : "post"}`,
        (current, total, message) => {
          console.log(`ZIP Progress: ${current}/${total} - ${message}`);
          setZipProgress((prev) => ({
            ...prev,
            progress: current,
            total,
            message,
            status: current === total ? "creating" : "downloading",
          }));
        }
      );

      console.log("ZIP download completed:", zipResult);

      setZipProgress((prev) => ({
        ...prev,
        status: "success",
        message: `Successfully downloaded ${zipResult.downloadedItems} of ${zipResult.totalItems} items as ${zipResult.zipName}`,
      }));

      // Auto-close after 5 seconds for success
      setTimeout(() => {
        setZipProgress((prev) => ({ ...prev, isVisible: false }));
      }, 5000);
    } catch (error) {
      console.error("ZIP download failed:", error);

      // Provide more detailed error information
      let errorMessage = "Failed to create ZIP file";
      if (error.message.includes("Failed to download any media files")) {
        errorMessage =
          "Could not download any media files. This might be due to CORS restrictions or network issues.";
      } else if (error.message.includes("fetch")) {
        errorMessage =
          "Network error while downloading media files. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setZipProgress((prev) => ({
        ...prev,
        status: "error",
        message: errorMessage,
      }));
    }
  };

  const closeZipProgress = () => {
    setZipProgress((prev) => ({ ...prev, isVisible: false }));
  };

  // Alternative download method for when ZIP fails
  const handleBulkIndividualDownload = () => {
    result.items.forEach((item, index) => {
      setTimeout(() => {
        handleDownload(
          item.media,
          `instagram_${item.isVideo ? "video" : "image"}_${index + 1}`,
          item.isVideo
        );
      }, index * 1000); // 1 second delay between downloads
    });
  };

  return (
    <div className="space-y-6 animate-bounce-in">
      <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-2xl backdrop-blur-sm">
        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse neon-glow">
          <CheckCircle className="w-6 h-6 text-white flex-shrink-0" />
        </div>
        <div className="flex-1">
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

        {/* Bulk Download Options for multiple items */}
        {shouldOfferZipDownload(result.items) && (
          <div className="flex flex-col items-end space-y-2">
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleZipDownload}
                className="btn-accent flex items-center space-x-2 group/zip"
                title={`Download all ${
                  result.items.length
                } items as ZIP (${estimateZipSize(result.items)})`}
              >
                <Archive className="w-5 h-5 group-hover/zip:animate-bounce" />
                <span className="font-bold">📦 Download ZIP</span>
              </button>

              <button
                onClick={handleBulkIndividualDownload}
                className="btn-secondary text-xs flex items-center space-x-2 group/bulk"
                title="Download all items individually (fallback if ZIP fails)"
              >
                <Download className="w-4 h-4 group-hover/bulk:animate-bounce" />
                <span className="font-medium">⚡ Download All</span>
              </button>
            </div>

            <div className="text-right">
              <p className="text-xs text-green-600 dark:text-green-400">
                ZIP: {estimateZipSize(result.items)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {result.items.length} items
              </p>
            </div>
          </div>
        )}
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
              <MediaThumbnail
                item={item}
                index={index}
                onClick={() => window.open(item.media, "_blank")}
              />

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

      {/* ZIP Download Progress Modal */}
      <ZipDownloadProgress
        isVisible={zipProgress.isVisible}
        onClose={closeZipProgress}
        progress={zipProgress.progress}
        total={zipProgress.total}
        status={zipProgress.status}
        message={zipProgress.message}
        estimatedSize={zipProgress.estimatedSize}
      />
    </div>
  );
};

export default DownloadResult;
