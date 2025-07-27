import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Downloads multiple media files as a ZIP archive
 * @param {Array} items - Array of media items with {media: url, isVideo: boolean}
 * @param {string} zipName - Name for the ZIP file
 * @param {Function} onProgress - Progress callback (current, total)
 */
export const downloadAsZip = async (items, zipName = 'instagram_media', onProgress = null) => {
  if (!items || items.length === 0) {
    throw new Error('No items to download');
  }

  const zip = new JSZip();
  const totalItems = items.length;
  let completedItems = 0;

  // Helper function to fetch file as blob
  const fetchAsBlob = async (url) => {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        headers: {
          'Accept': '*/*',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.warn(`Failed to fetch ${url}:`, error);
      // Return null for failed downloads
      return null;
    }
  };

  // Helper function to get file extension from URL or content type
  const getFileExtension = (url, contentType, isVideo) => {
    // Try to get extension from URL
    const urlExtension = url.split('.').pop().split('?')[0].toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'avi'].includes(urlExtension)) {
      return urlExtension;
    }

    // Fallback based on content type
    if (contentType) {
      if (contentType.includes('jpeg')) return 'jpg';
      if (contentType.includes('png')) return 'png';
      if (contentType.includes('webp')) return 'webp';
      if (contentType.includes('mp4')) return 'mp4';
      if (contentType.includes('video')) return 'mp4';
    }

    // Final fallback based on isVideo flag
    return isVideo ? 'mp4' : 'jpg';
  };

  // Process each media item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const mediaType = item.isVideo ? 'video' : 'image';
    
    try {
      if (onProgress) {
        onProgress(i, totalItems, `Downloading ${mediaType} ${i + 1}...`);
      }

      const blob = await fetchAsBlob(item.media);
      
      if (blob) {
        const extension = getFileExtension(item.media, blob.type, item.isVideo);
        const fileName = `${mediaType}_${String(i + 1).padStart(2, '0')}.${extension}`;
        
        zip.file(fileName, blob);
        completedItems++;
      } else {
        console.warn(`Skipping item ${i + 1} due to download failure`);
      }
    } catch (error) {
      console.error(`Error processing item ${i + 1}:`, error);
    }
  }

  if (completedItems === 0) {
    throw new Error('Failed to download any media files');
  }

  // Generate and download ZIP
  if (onProgress) {
    onProgress(totalItems, totalItems, 'Creating ZIP file...');
  }

  try {
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });

    const finalZipName = `${zipName}_${new Date().toISOString().slice(0, 10)}.zip`;
    saveAs(zipBlob, finalZipName);

    return {
      success: true,
      downloadedItems: completedItems,
      totalItems: totalItems,
      zipName: finalZipName
    };
  } catch (error) {
    throw new Error(`Failed to create ZIP file: ${error.message}`);
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
  if (!items || items.length === 0) return '0 MB';
  
  // Rough estimates: images ~500KB, videos ~2MB
  const imageCount = items.filter(item => !item.isVideo).length;
  const videoCount = items.filter(item => item.isVideo).length;
  
  const estimatedSizeMB = (imageCount * 0.5) + (videoCount * 2);
  
  if (estimatedSizeMB < 1) {
    return `~${Math.round(estimatedSizeMB * 1000)} KB`;
  } else {
    return `~${Math.round(estimatedSizeMB * 10) / 10} MB`;
  }
};
