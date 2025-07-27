/**
 * Specialized Instagram media fetcher with multiple fallback strategies
 */

// Updated proxy services - some free alternatives that work better
const PROXY_SERVICES = [
  "https://api.allorigins.win/raw?url=",
  "https://cors-anywhere.herokuapp.com/",
  "https://thingproxy.freeboard.io/fetch/",
  "https://api.codetabs.com/v1/proxy?quest=",
];

// Helper function to create blob URL for CORS-restricted content
const createBlobFromResponse = async (response) => {
  try {
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], {
      type: response.headers.get("content-type") || "application/octet-stream",
    });
    return blob;
  } catch (error) {
    console.warn("Failed to create blob from response:", error);
    return null;
  }
};

/**
 * Attempts to fetch Instagram media using various strategies
 * @param {string} url - Instagram media URL
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<Blob|null>} - Media blob or null if failed
 */
export const fetchInstagramMedia = async (url, retries = 2) => {
  console.log(`Fetching Instagram media: ${url}`);

  // Strategy 1: Direct fetch with optimized headers
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Direct fetch attempt ${attempt + 1}/${retries}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://www.instagram.com/",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        mode: "cors",
        credentials: "omit",
      });

      if (response.ok && response.status === 200) {
        const blob = await createBlobFromResponse(response);
        if (blob && blob.size > 100) {
          // Ensure we have actual content
          console.log(
            `Direct fetch successful: ${blob.size} bytes, type: ${blob.type}`
          );
          return blob;
        }
      }
    } catch (error) {
      console.log(`Direct fetch attempt ${attempt + 1} failed:`, error.message);
      if (attempt < retries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
      }
    }
  }

  // Strategy 2: Try proxy services with better error handling
  for (let i = 0; i < PROXY_SERVICES.length; i++) {
    const proxyService = PROXY_SERVICES[i];
    try {
      console.log(
        `Trying proxy ${i + 1}/${PROXY_SERVICES.length}: ${proxyService}`
      );

      const proxyUrl = proxyService + encodeURIComponent(url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(proxyUrl, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok && response.status === 200) {
        const blob = await createBlobFromResponse(response);
        if (blob && blob.size > 100) {
          console.log(
            `Proxy ${i + 1} fetch successful: ${blob.size} bytes, type: ${
              blob.type
            }`
          );
          return blob;
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log(`Proxy ${i + 1} timed out`);
      } else {
        console.log(`Proxy ${i + 1} failed:`, error.message);
      }
    }
  }

  // Strategy 3: Alternative fetch methods
  const fetchConfigs = [
    {
      mode: "no-cors",
      headers: {
        Accept: "*/*",
        "Sec-Fetch-Mode": "no-cors",
      },
    },
  ];

  for (const config of fetchConfigs) {
    try {
      console.log(`Trying alternative fetch with mode: ${config.mode}`);

      const response = await fetch(url, {
        method: "GET",
        ...config,
      });

      // Note: no-cors responses are opaque, so we can't read them directly
      // But we can try to create an object URL for display purposes
      if (config.mode === "no-cors") {
        // For no-cors, we return a special indicator that the URL might work for display
        console.log(
          "No-cors fetch completed - URL may work for direct display"
        );
        return "no-cors-success"; // Special indicator
      }
    } catch (error) {
      console.log(`Alternative fetch failed:`, error.message);
    }
  }

  console.warn(`All strategies failed for: ${url}`);
  return null;
};

/**
 * Downloads multiple Instagram media files with progress tracking
 * @param {Array} mediaUrls - Array of Instagram media URLs
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} - Array of successful blob downloads
 */
export const downloadInstagramMediaBatch = async (
  mediaUrls,
  onProgress = null
) => {
  const results = [];
  const total = mediaUrls.length;

  for (let i = 0; i < mediaUrls.length; i++) {
    const url = mediaUrls[i];

    if (onProgress) {
      onProgress(i, total, `Downloading media ${i + 1}/${total}...`);
    }

    try {
      const blob = await fetchInstagramMedia(url);
      if (blob && blob !== "no-cors-success") {
        results.push({ url, blob, success: true });
      } else if (blob === "no-cors-success") {
        // For no-cors success, we still mark it as successful but note the limitation
        results.push({ url, blob: null, success: true, noCors: true });
      } else {
        results.push({
          url,
          blob: null,
          success: false,
          error: "Failed to fetch",
        });
      }
    } catch (error) {
      results.push({ url, blob: null, success: false, error: error.message });
    }

    // Add delay between requests to avoid rate limiting
    if (i < mediaUrls.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }

  return results;
};

/**
 * Checks if a URL is likely to be an Instagram media URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if likely Instagram media
 */
export const isInstagramMediaUrl = (url) => {
  return (
    url &&
    (url.includes("cdninstagram.com") ||
      url.includes("fbcdn.net") ||
      url.includes("instagram.com") ||
      url.includes("scontent") ||
      url.includes("instagramcdn.com"))
  );
};

/**
 * Creates a fallback image URL for when direct loading fails
 * @param {string} originalUrl - Original media URL
 * @returns {string} - Fallback URL or placeholder
 */
export const getFallbackImageUrl = (originalUrl) => {
  // Return the original URL with cache-busting parameter
  const separator = originalUrl.includes("?") ? "&" : "?";
  return `${originalUrl}${separator}t=${Date.now()}`;
};
