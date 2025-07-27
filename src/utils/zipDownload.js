import JSZip from "jszip";
import { saveAs } from "file-saver";
import { fetchInstagramMedia, isInstagramMediaUrl } from "./instagramFetcher";

/**
 * Downloads multiple media files as a ZIP archive
 * @param {Array} items - Array of media items with {media: url, isVideo: boolean}
 * @param {string} zipName - Name for the ZIP file
 * @param {Function} onProgress - Progress callback (current, total)
 */
export const downloadAsZip = async (
  items,
  zipName = "instagram_media",
  onProgress = null
) => {
  if (!items || items.length === 0) {
    throw new Error("No items to download");
  }

  // Check if we're dealing with multiple images (common issue case)
  const imageCount = items.filter((item) => !item.isVideo).length;
  const videoCount = items.filter((item) => item.isVideo).length;

  console.log(
    `ZIP Download starting: ${imageCount} images, ${videoCount} videos`
  );

  // For image-heavy posts, warn user about potential CORS issues
  if (imageCount > videoCount && imageCount > 2) {
    console.warn(
      "Multiple images detected - CORS restrictions may prevent some downloads"
    );
  }

  const zip = new JSZip();
  const totalItems = items.length;
  let completedItems = 0;

  // Helper function to fetch file as blob
  const fetchAsBlob = async (url) => {
    console.log(`Attempting to fetch: ${url}`);

    try {
      // Use specialized Instagram fetcher for Instagram URLs
      if (isInstagramMediaUrl(url)) {
        console.log("Using specialized Instagram fetcher...");
        const blob = await fetchInstagramMedia(url);
        if (blob && blob.size > 0) {
          console.log(`Instagram fetcher successful: ${blob.size} bytes`);
          return blob;
        }
        console.log("Instagram fetcher failed, trying fallback methods...");
      }

      // Fallback to general fetch strategies for non-Instagram URLs or if Instagram fetcher fails
      const fetchStrategies = [
        // Strategy 1: CORS mode with proper headers
        async () => {
          const response = await fetch(url, {
            mode: "cors",
            credentials: "omit",
            headers: {
              Accept: "*/*",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              Referer: "https://www.instagram.com/",
            },
          });
          return response.ok ? await response.blob() : null;
        },

        // Strategy 2: Simple fetch
        async () => {
          const response = await fetch(url);
          return response.ok ? await response.blob() : null;
        },

        // Strategy 3: Proxy approach
        async () => {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
            url
          )}`;
          const response = await fetch(proxyUrl);
          return response.ok ? await response.blob() : null;
        },
      ];

      for (let i = 0; i < fetchStrategies.length; i++) {
        try {
          console.log(`Trying fallback strategy ${i + 1}...`);
          const blob = await fetchStrategies[i]();
          if (blob && blob.size > 0) {
            console.log(
              `Fallback strategy ${i + 1} successful: ${blob.size} bytes`
            );
            return blob;
          }
        } catch (error) {
          console.log(`Fallback strategy ${i + 1} failed: ${error.message}`);
        }
      }

      console.warn(`All fetch strategies failed for: ${url}`);
      return null;
    } catch (error) {
      console.error(`Unexpected error fetching ${url}:`, error);
      return null;
    }
  };

  // Helper function to get file extension from URL or content type
  const getFileExtension = (url, contentType, isVideo) => {
    // Try to get extension from URL
    const urlExtension = url.split(".").pop().split("?")[0].toLowerCase();
    if (
      ["jpg", "jpeg", "png", "webp", "mp4", "mov", "avi"].includes(urlExtension)
    ) {
      return urlExtension;
    }

    // Fallback based on content type
    if (contentType) {
      if (contentType.includes("jpeg")) return "jpg";
      if (contentType.includes("png")) return "png";
      if (contentType.includes("webp")) return "webp";
      if (contentType.includes("mp4")) return "mp4";
      if (contentType.includes("video")) return "mp4";
    }

    // Final fallback based on isVideo flag
    return isVideo ? "mp4" : "jpg";
  };

  // Process each media item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const mediaType = item.isVideo ? "video" : "image";

    try {
      if (onProgress) {
        onProgress(i, totalItems, `Downloading ${mediaType} ${i + 1}...`);
      }

      console.log(`Attempting to download ${mediaType} ${i + 1}:`, item.media);
      const blob = await fetchAsBlob(item.media);

      if (blob && blob.size > 0) {
        const extension = getFileExtension(item.media, blob.type, item.isVideo);
        const fileName = `${mediaType}_${String(i + 1).padStart(
          2,
          "0"
        )}.${extension}`;

        console.log(
          `Successfully downloaded ${fileName}, size: ${blob.size} bytes`
        );
        zip.file(fileName, blob);
        completedItems++;
      } else {
        console.warn(
          `Skipping item ${i + 1} due to download failure or empty blob`
        );
      }
    } catch (error) {
      console.error(`Error processing item ${i + 1}:`, error);
    }

    // Add a small delay between downloads to prevent overwhelming the server
    if (i < items.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(
    `ZIP creation summary: ${completedItems}/${totalItems} items successfully downloaded`
  );

  if (completedItems === 0) {
    throw new Error(
      `Failed to download any media files. All ${totalItems} downloads failed due to CORS restrictions or network issues.`
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
        level: 6,
      },
    });

    console.log(`ZIP generated successfully: ${zipBlob.size} bytes`);

    const finalZipName = `${zipName}_${new Date()
      .toISOString()
      .slice(0, 10)}.zip`;

    console.log(`Downloading ZIP as: ${finalZipName}`);
    saveAs(zipBlob, finalZipName);

    return {
      success: true,
      downloadedItems: completedItems,
      totalItems: totalItems,
      zipName: finalZipName,
      skippedItems: totalItems - completedItems,
    };
  } catch (error) {
    console.error("ZIP generation failed:", error);
    throw new Error(
      `Failed to create ZIP file: ${error.message}. Successfully downloaded ${completedItems}/${totalItems} items but couldn't create the archive.`
    );
  }
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
 * Estimates ZIP file size (rough approximation)
 * @param {Array} items - Array of media items
 * @returns {string} - Estimated size string
 */
export const estimateZipSize = (items) => {
  if (!items || items.length === 0) return "0 MB";

  // Rough estimates: images ~500KB, videos ~2MB
  const imageCount = items.filter((item) => !item.isVideo).length;
  const videoCount = items.filter((item) => item.isVideo).length;

  const estimatedSizeMB = imageCount * 0.5 + videoCount * 2;

  if (estimatedSizeMB < 1) {
    return `~${Math.round(estimatedSizeMB * 1000)} KB`;
  } else {
    return `~${Math.round(estimatedSizeMB * 10) / 10} MB`;
  }
};
