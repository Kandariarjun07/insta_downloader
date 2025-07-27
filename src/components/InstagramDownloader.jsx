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
    <div className="card p-8 animate-scale-in neon-glow">
      <div className="space-y-8">
        {/* Mode Toggle */}
        <div className="flex items-center justify-center space-x-2 p-2 bg-gradient-to-r from-gray-100/50 to-gray-200/50 dark:from-dark-surface/50 dark:to-dark-border/50 rounded-2xl backdrop-blur-sm">
          <button
            onClick={() => setIsBatchMode(false)}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-500 transform ${
              !isBatchMode
                ? "bg-gradient-to-r from-primary-500 to-instagram-pink text-white shadow-xl scale-105 neon-glow"
                : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-dark-card/50 hover:scale-105"
            }`}
          >
            <span className="flex items-center gap-2">📱 Single Download</span>
          </button>
          <button
            onClick={() => setIsBatchMode(true)}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-500 transform ${
              isBatchMode
                ? "bg-gradient-to-r from-secondary-500 to-instagram-blue text-white shadow-xl scale-105 neon-glow"
                : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-dark-card/50 hover:scale-105"
            }`}
          >
            <span className="flex items-center gap-2">⚡ Batch Download</span>
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
          <div className="flex items-center space-x-3 p-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-200 dark:border-red-700 rounded-2xl animate-bounce-in backdrop-blur-sm">
            <div className="p-2 bg-red-500 rounded-full animate-pulse">
              <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
            </div>
            <div>
              <p className="font-semibold text-red-800 dark:text-red-200">
                Oops! Something went wrong
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-4 p-12 bg-gradient-to-br from-primary-50/50 to-secondary-50/50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl backdrop-blur-sm border border-primary-200/50 dark:border-primary-700/50">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-instagram-pink rounded-full animate-pulse"></div>
              <Loader2 className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold gradient-text">
                Processing your request...
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                ✨ Working some magic ✨
              </p>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-instagram-pink rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && <DownloadResult result={result} />}
      </div>
    </div>
  );
};

export default InstagramDownloader;
