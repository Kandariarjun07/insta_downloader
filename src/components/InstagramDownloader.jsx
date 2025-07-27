import { useState } from "react";
import {
  Download,
  Link,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import UrlInput from "./UrlInput";
import DownloadResult from "./DownloadResult";
import BatchDownloader from "./BatchDownloader";
import { getApiConfig, buildApiUrl } from "../utils/config";

const InstagramDownloader = ({ onDownloadComplete }) => {
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isBatchMode, setIsBatchMode] = useState(false);

  const validateInstagramUrl = (url) => {
    const instagramRegex =
      /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reels?|stories)\/[\w-]+\/?/;
    return instagramRegex.test(url);
  };

  const downloadMedia = async (targetUrl) => {
    if (!targetUrl.trim()) {
      setError("Please enter an Instagram URL");
      return;
    }

    if (!validateInstagramUrl(targetUrl)) {
      setError("Please enter a valid Instagram post, reel, or story URL");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const { headers } = getApiConfig();
      const apiUrl = buildApiUrl(targetUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (data && data.data && data.data.length > 0) {
        const downloadData = {
          url: targetUrl,
          items: data.data,
        };
        setResult(downloadData);
        onDownloadComplete(downloadData);
      } else {
        setError(
          "Could not fetch download links. Please check the URL and try again."
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleDownload = () => {
    downloadMedia(url);
  };

  const handleBatchDownload = async () => {
    const validUrls = urls.filter(
      (u) => u.trim() && validateInstagramUrl(u.trim())
    );

    if (validUrls.length === 0) {
      setError("Please enter at least one valid Instagram URL");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const { headers } = getApiConfig();
      const allResults = [];
      let hasErrors = false;

      // Process URLs one by one to avoid rate limiting
      for (const targetUrl of validUrls) {
        try {
          const apiUrl = buildApiUrl(targetUrl.trim());

          const response = await fetch(apiUrl, {
            method: "GET",
            headers,
          });

          const data = await response.json();

          if (data && data.data && data.data.length > 0) {
            const downloadData = {
              url: targetUrl.trim(),
              items: data.data,
            };
            allResults.push(downloadData);
            onDownloadComplete(downloadData);
          } else {
            hasErrors = true;
            console.error(`Failed to fetch data for URL: ${targetUrl}`);
          }
        } catch (err) {
          hasErrors = true;
          console.error(`Error processing URL ${targetUrl}:`, err.message);
        }

        // Add a small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (allResults.length > 0) {
        // Combine all results into a single result object
        const combinedResult = {
          url: `Batch download (${allResults.length} URLs)`,
          items: allResults.flatMap((result) => result.items),
          batchResults: allResults, // Keep individual results for reference
        };
        setResult(combinedResult);
      }

      if (hasErrors && allResults.length === 0) {
        setError(
          "Could not fetch download links for any URLs. Please check the URLs and try again."
        );
      } else if (hasErrors) {
        setError(
          `Successfully processed ${allResults.length} out of ${validUrls.length} URLs. Some URLs failed to download.`
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-6 animate-slide-up">
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setIsBatchMode(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              !isBatchMode
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Single Download
          </button>
          <button
            onClick={() => setIsBatchMode(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              isBatchMode
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Batch Download
          </button>
        </div>

        {/* Input Section */}
        {isBatchMode ? (
          <BatchDownloader
            urls={urls}
            setUrls={setUrls}
            onDownload={handleBatchDownload}
            isLoading={isLoading}
          />
        ) : (
          <UrlInput
            url={url}
            setUrl={setUrl}
            onDownload={handleSingleDownload}
            isLoading={isLoading}
            validateUrl={validateInstagramUrl}
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-slide-up">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center space-x-3 p-8">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <p className="text-gray-600 dark:text-gray-300">
              Processing your request...
            </p>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && <DownloadResult result={result} />}
      </div>
    </div>
  );
};

export default InstagramDownloader;
