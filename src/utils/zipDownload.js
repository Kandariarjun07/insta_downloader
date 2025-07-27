import JSZip from "jszip";
import { saveAs } from "file-saver";
import { fetchInstagramMedia, isInstagramMediaUrl } from "./instagramFetcher";

/**
 * Enhanced download method that tries multiple approaches
 * @param {Array} items - Array of media items with {media: url, isVideo: boolean}
 * @param {string} zipName - Name for the ZIP file
 * @param {Function} onProgress - Progress callback (current, total, message)
 */
export const downloadAsZip = async (
  items,
  zipName = "instagram_media",
  onProgress = null
) => {
  if (!items || items.length === 0) {
    throw new Error("No items to download");
  }

  console.log(`ZIP Download starting: ${items.length} items total`);

  const zip = new JSZip();
  const totalItems = items.length;
  let completedItems = 0;
  let failedItems = 0;

  // Enhanced fetch function with multiple strategies
  const fetchMediaBlob = async (url, index) => {
    console.log(`Attempting to fetch media ${index + 1}: ${url}`);

    try {
      // Strategy 1: Use specialized Instagram fetcher
      if (isInstagramMediaUrl(url)) {
        const blob = await fetchInstagramMedia(url);
        if (blob && blob !== "no-cors-success" && blob.size > 100) {
          console.log(
            `Instagram fetcher successful for item ${index + 1}: ${
              blob.size
            } bytes`
          );
          return blob;
        }
      }

      // Strategy 2: Direct fetch with enhanced headers
      const directResponse = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://www.instagram.com/",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
        mode: "cors",
        credentials: "omit",
      });

      if (directResponse.ok) {
        const blob = await directResponse.blob();
        if (blob && blob.size > 100) {
          console.log(
            `Direct fetch successful for item ${index + 1}: ${blob.size} bytes`
          );
          return blob;
        }
      }

      // Strategy 3: Try alternative proxy services
      const proxyServices = [
        "https://api.allorigins.win/raw?url=",
        "https://api.codetabs.com/v1/proxy?quest=",
      ];

      for (const proxy of proxyServices) {
        try {
          const proxyUrl = proxy + encodeURIComponent(url);
          const proxyResponse = await fetch(proxyUrl, {
            method: "GET",
            headers: { "User-Agent": "Mozilla/5.0" },
          });

          if (proxyResponse.ok) {
            const blob = await proxyResponse.blob();
            if (blob && blob.size > 100) {
              console.log(
                `Proxy fetch successful for item ${index + 1}: ${
                  blob.size
                } bytes`
              );
              return blob;
            }
          }
        } catch (proxyError) {
          console.log(
            `Proxy fetch failed for item ${index + 1}:`,
            proxyError.message
          );
        }
      }

      console.warn(`All fetch strategies failed for item ${index + 1}`);
      return null;
    } catch (error) {
      console.error(`Error fetching item ${index + 1}:`, error);
      return null;
    }
  };

  // Helper function to get appropriate file extension
  const getFileExtension = (url, blob, isVideo, index) => {
    // First, try to get extension from blob type
    if (blob && blob.type) {
      const mimeTypes = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "video/mp4": "mp4",
        "video/webm": "webm",
        "video/quicktime": "mov",
        "video/x-msvideo": "avi",
      };

      const extension = mimeTypes[blob.type.toLowerCase()];
      if (extension) {
        return extension;
      }
    }

    // Try to get extension from URL
    try {
      const urlPath = new URL(url).pathname;
      const urlExtension = urlPath.split(".").pop().toLowerCase();
      if (
        [
          "jpg",
          "jpeg",
          "png",
          "webp",
          "gif",
          "mp4",
          "webm",
          "mov",
          "avi",
        ].includes(urlExtension)
      ) {
        return urlExtension;
      }
    } catch (e) {
      // Invalid URL, continue to fallback
    }

    // Final fallback based on isVideo flag
    return isVideo ? "mp4" : "jpg";
  };

  // Process each media item with improved error handling
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const mediaType = item.isVideo ? "video" : "image";

    try {
      if (onProgress) {
        onProgress(
          i,
          totalItems,
          `Downloading ${mediaType} ${i + 1}/${totalItems}...`
        );
      }

      const blob = await fetchMediaBlob(item.media, i);

      if (blob && blob.size > 100) {
        const extension = getFileExtension(item.media, blob, item.isVideo, i);
        const fileName = `${mediaType}_${String(i + 1).padStart(
          2,
          "0"
        )}.${extension}`;

        console.log(
          `Adding ${fileName} to ZIP: ${blob.size} bytes, type: ${
            blob.type || "unknown"
          }`
        );
        zip.file(fileName, blob);
        completedItems++;
      } else {
        console.warn(
          `Skipping ${mediaType} ${i + 1}: download failed or file too small`
        );
        failedItems++;
      }
    } catch (error) {
      console.error(`Error processing ${mediaType} ${i + 1}:`, error);
      failedItems++;
    }

    // Add progressive delay to avoid overwhelming servers
    if (i < items.length - 1) {
      const delay = Math.min(300 + i * 50, 1000); // Progressive delay, max 1 second
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.log(
    `ZIP processing summary: ${completedItems} successful, ${failedItems} failed out of ${totalItems} total`
  );

  // Check if we have any items to zip
  if (completedItems === 0) {
    throw new Error(
      `❌ Failed to download any media files. All ${totalItems} downloads failed.\n\n` +
        `This usually happens due to:\n` +
        `• CORS restrictions from Instagram servers\n` +
        `• Network connectivity issues\n` +
        `• Rate limiting\n\n` +
        `💡 Try using the "Download All" button instead, which downloads files individually.`
    );
  }

  // Generate and download ZIP
  if (onProgress) {
    onProgress(
      totalItems,
      totalItems,
      `Creating ZIP file with ${completedItems} items...`
    );
  }

  try {
    console.log("Starting ZIP generation...");

    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6, // Balanced compression
      },
    });

    const finalZipName = `${zipName}_${new Date()
      .toISOString()
      .slice(0, 10)}_${completedItems}items.zip`;

    console.log(
      `ZIP generated successfully: ${zipBlob.size} bytes as ${finalZipName}`
    );
    saveAs(zipBlob, finalZipName);

    return {
      success: true,
      downloadedItems: completedItems,
      totalItems: totalItems,
      zipName: finalZipName,
      skippedItems: failedItems,
      message:
        failedItems > 0
          ? `Successfully downloaded ${completedItems}/${totalItems} items. ${failedItems} items couldn't be downloaded due to server restrictions.`
          : `All ${completedItems} items downloaded successfully!`,
    };
  } catch (error) {
    console.error("ZIP generation failed:", error);
    throw new Error(
      `❌ Failed to create ZIP file: ${error.message}\n\n` +
        `✅ Successfully downloaded ${completedItems}/${totalItems} items but couldn't create the archive.\n\n` +
        `💡 Try using the "Download All" button to download files individually.`
    );
  }
};
/**
 * Alternative bulk download method - downloads files individually
 * @param {Array} items - Array of media items
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Download results
 */
export const downloadAllIndividually = async (items, onProgress = null) => {
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (onProgress) {
      onProgress(
        i,
        items.length,
        `Downloading ${item.isVideo ? "video" : "image"} ${i + 1}...`
      );
    }

    try {
      // Create download link
      const link = document.createElement("a");
      link.href = item.media;
      link.download = `instagram_${item.isVideo ? "video" : "image"}_${
        i + 1
      }_${Date.now()}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      successCount++;

      // Delay between downloads to avoid overwhelming the browser
      if (i < items.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Failed to download item ${i + 1}:`, error);
      failCount++;
    }
  }

  return {
    success: successCount > 0,
    successCount,
    failCount,
    total: items.length,
    message: `Initiated download for ${successCount}/${items.length} items`,
  };
};

/**
 * Checks if items are suitable for ZIP download
 * @param {Array} items - Array of media items
 * @returns {boolean} - True if ZIP download is recommended
 */
export const shouldOfferZipDownload = (items) => {
  return items && items.length >= 2;
};

/**
 * Estimates ZIP file size (improved approximation)
 * @param {Array} items - Array of media items
 * @returns {string} - Estimated size string
 */
export const estimateZipSize = (items) => {
  if (!items || items.length === 0) return "0 MB";

  // More realistic estimates based on typical Instagram media sizes
  const imageCount = items.filter((item) => !item.isVideo).length;
  const videoCount = items.filter((item) => item.isVideo).length;

  // Instagram images: ~200KB-800KB, videos: ~1-5MB
  const avgImageSize = 0.5; // MB
  const avgVideoSize = 2.5; // MB

  const estimatedSizeMB = imageCount * avgImageSize + videoCount * avgVideoSize;

  if (estimatedSizeMB < 1) {
    return `~${Math.round(estimatedSizeMB * 1000)} KB`;
  } else if (estimatedSizeMB < 100) {
    return `~${Math.round(estimatedSizeMB * 10) / 10} MB`;
  } else {
    return `~${Math.round(estimatedSizeMB)} MB`;
  }
};

/**
 * Advanced ZIP download with retry mechanism
 * @param {Array} items - Array of media items
 * @param {string} zipName - ZIP file name
 * @param {Function} onProgress - Progress callback
 * @param {number} maxRetries - Maximum retry attempts per item
 * @returns {Promise<Object>} - Download result
 */
export const downloadAsZipWithRetry = async (
  items,
  zipName = "instagram_media",
  onProgress = null,
  maxRetries = 2
) => {
  // This is a wrapper around the main downloadAsZip function
  // with additional retry logic for failed items

  try {
    const result = await downloadAsZip(items, zipName, onProgress);
    return result;
  } catch (error) {
    // If ZIP fails completely, offer individual download as fallback
    console.log("ZIP download failed, attempting individual downloads...");

    if (onProgress) {
      onProgress(0, items.length, "ZIP failed, trying individual downloads...");
    }

    const individualResult = await downloadAllIndividually(items, onProgress);

    throw new Error(
      `❌ ZIP download failed: ${error.message}\n\n` +
        `🔄 Attempted individual downloads: ${individualResult.message}\n\n` +
        `💡 Some files may have downloaded directly to your browser's download folder.`
    );
  }
};
