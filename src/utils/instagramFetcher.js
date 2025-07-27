/**
 * Specialized Instagram media fetcher with multiple fallback strategies
 */

// List of working proxy services
const PROXY_SERVICES = [
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/',
];

/**
 * Attempts to fetch Instagram media using various strategies
 * @param {string} url - Instagram media URL
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<Blob|null>} - Media blob or null if failed
 */
export const fetchInstagramMedia = async (url, retries = 3) => {
  console.log(`Fetching Instagram media: ${url}`);
  
  // Strategy 1: Direct fetch (works for some Instagram URLs)
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Direct fetch attempt ${attempt + 1}/${retries}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'image/*,video/*,*/*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://www.instagram.com/',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (response.ok) {
        const blob = await response.blob();
        if (blob && blob.size > 0) {
          console.log(`Direct fetch successful: ${blob.size} bytes`);
          return blob;
        }
      }
    } catch (error) {
      console.log(`Direct fetch attempt ${attempt + 1} failed:`, error.message);
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  // Strategy 2: Try proxy services
  for (const proxyService of PROXY_SERVICES) {
    try {
      console.log(`Trying proxy: ${proxyService}`);
      
      const proxyUrl = proxyService + encodeURIComponent(url);
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*,video/*,*/*',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        if (blob && blob.size > 0) {
          console.log(`Proxy fetch successful: ${blob.size} bytes`);
          return blob;
        }
      }
    } catch (error) {
      console.log(`Proxy ${proxyService} failed:`, error.message);
    }
  }

  // Strategy 3: Try with different headers and modes
  const fetchConfigs = [
    {
      mode: 'no-cors',
      headers: { 'Accept': '*/*' }
    },
    {
      mode: 'cors',
      headers: { 
        'Accept': '*/*',
        'Origin': 'https://www.instagram.com'
      }
    }
  ];

  for (const config of fetchConfigs) {
    try {
      console.log(`Trying fetch with mode: ${config.mode}`);
      
      const response = await fetch(url, {
        method: 'GET',
        ...config
      });

      // Note: no-cors responses are opaque, so we can't read them
      if (config.mode === 'cors' && response.ok) {
        const blob = await response.blob();
        if (blob && blob.size > 0) {
          console.log(`Alternative fetch successful: ${blob.size} bytes`);
          return blob;
        }
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
export const downloadInstagramMediaBatch = async (mediaUrls, onProgress = null) => {
  const results = [];
  const total = mediaUrls.length;

  for (let i = 0; i < mediaUrls.length; i++) {
    const url = mediaUrls[i];
    
    if (onProgress) {
      onProgress(i, total, `Downloading media ${i + 1}/${total}...`);
    }

    try {
      const blob = await fetchInstagramMedia(url);
      if (blob) {
        results.push({ url, blob, success: true });
      } else {
        results.push({ url, blob: null, success: false, error: 'Failed to fetch' });
      }
    } catch (error) {
      results.push({ url, blob: null, success: false, error: error.message });
    }

    // Add delay between requests to avoid rate limiting
    if (i < mediaUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 800));
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
  return url && (
    url.includes('cdninstagram.com') ||
    url.includes('fbcdn.net') ||
    url.includes('instagram.com') ||
    url.includes('scontent')
  );
};
