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

      if (!response.ok) {
        // Handle different HTTP status codes
        if (response.status === 401) {
          throw new Error(
            "🔑 API authentication failed. Please check your RapidAPI key configuration in Netlify environment variables."
          );
        } else if (response.status === 403) {
          throw new Error(
            "🚫 API access forbidden. Your RapidAPI subscription might have expired or you've exceeded the rate limit."
          );
        } else if (response.status === 404) {
          throw new Error(
            "🔍 Content not found. The Instagram post might be private, deleted, or the URL is incorrect."
          );
        } else if (response.status === 429) {
          throw new Error(
            "⏰ Rate limit exceeded. Please wait a moment before trying again."
          );
        } else if (response.status >= 500) {
          throw new Error(
            "🛠️ Server error. The API service is temporarily unavailable. Please try again later."
          );
        } else {
          throw new Error(
            `❌ Request failed with status ${response.status}. Please try again.`
          );
        }
      }

      const data = await response.json();

      // Better validation of response data
      if (!data || typeof data !== "object") {
        throw new Error(
          "🔧 Invalid response format from API. Please try again or contact support."
        );
      }

      // Check for API-specific error messages
      if (data.error) {
        throw new Error(`🚨 API Error: ${data.error}`);
      }

      if (
        data &&
        data.data &&
        Array.isArray(data.data) &&
        data.data.length > 0
      ) {
        // Validate that we have actual media items
        const validItems = data.data.filter(
          (item) => item && item.media && typeof item.media === "string"
        );

        if (validItems.length === 0) {
          throw new Error(
            "📱 No downloadable media found in this post. The content might be text-only or contain unsupported media types."
          );
        }

        const downloadData = {
          url: targetUrl,
          items: validItems,
        };

        console.log(
          `Successfully found ${validItems.length} downloadable items`
        );
        setResult(downloadData);
        onDownloadComplete(downloadData);
      } else {
        throw new Error(
          "📱 No downloadable content found. This could happen if:\n\n" +
            "• The post is private or restricted\n" +
            "• The URL is incorrect or expired\n" +
            "• The content doesn't contain downloadable media\n" +
            "• Instagram has changed their content structure\n\n" +
            "💡 Try refreshing the Instagram page and copying the URL again."
        );
      }
    } catch (err) {
      console.error("Download error:", err);

      // Handle network and configuration errors
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(
          "🌐 Network error. Please check your internet connection and try again."
        );
      } else if (err.message.includes("API key not configured")) {
        setError(err.message); // This already has good formatting from config.js
      } else {
        setError(err.message);
      }
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
      const failedUrls = [];

      // Process URLs one by one to avoid rate limiting
      for (let i = 0; i < validUrls.length; i++) {
        const targetUrl = validUrls[i];
        try {
          console.log(
            `Processing batch URL ${i + 1}/${validUrls.length}: ${targetUrl}`
          );

          const apiUrl = buildApiUrl(targetUrl.trim());

          const response = await fetch(apiUrl, {
            method: "GET",
            headers,
          });

          if (!response.ok) {
            console.error(`URL ${i + 1} failed with status ${response.status}`);
            hasErrors = true;
            failedUrls.push({
              url: targetUrl,
              error: `HTTP ${response.status}`,
            });
            continue;
          }

          const data = await response.json();

          if (
            data &&
            data.data &&
            Array.isArray(data.data) &&
            data.data.length > 0
          ) {
            const validItems = data.data.filter(
              (item) => item && item.media && typeof item.media === "string"
            );

            if (validItems.length > 0) {
              const downloadData = {
                url: targetUrl.trim(),
                items: validItems,
              };
              allResults.push(downloadData);
              onDownloadComplete(downloadData);
              console.log(
                `Successfully processed URL ${i + 1}: ${
                  validItems.length
                } items`
              );
            } else {
              hasErrors = true;
              failedUrls.push({
                url: targetUrl,
                error: "No valid media items found",
              });
            }
          } else {
            hasErrors = true;
            failedUrls.push({ url: targetUrl, error: "No data returned" });
            console.error(`Failed to fetch data for URL: ${targetUrl}`);
          }
        } catch (err) {
          hasErrors = true;
          failedUrls.push({ url: targetUrl, error: err.message });
          console.error(`Error processing URL ${targetUrl}:`, err.message);
        }

        // Add a progressive delay between requests (longer delays for more URLs)
        if (i < validUrls.length - 1) {
          const delay = Math.min(1000 + i * 200, 3000); // 1-3 second progressive delay
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      if (allResults.length > 0) {
        // Combine all results into a single result object
        const totalItems = allResults.reduce(
          (sum, result) => sum + result.items.length,
          0
        );

        const combinedResult = {
          url: `Batch download (${allResults.length} URLs, ${totalItems} items)`,
          items: allResults.flatMap((result) => result.items),
          batchResults: allResults, // Keep individual results for reference
        };

        console.log(
          `Batch download completed: ${allResults.length} successful URLs, ${totalItems} total items`
        );
        setResult(combinedResult);
      }

      // Provide detailed error reporting
      if (hasErrors && allResults.length === 0) {
        const errorDetails = failedUrls
          .map((failed, index) => `${index + 1}. URL failed: ${failed.error}`)
          .join("\n");

        setError(
          `❌ Could not process any URLs successfully.\n\n` +
            `Errors encountered:\n${errorDetails}\n\n` +
            `💡 Common causes:\n` +
            `• URLs are private or restricted\n` +
            `• Rate limiting from too many requests\n` +
            `• Network connectivity issues\n` +
            `• Invalid or expired URLs`
        );
      } else if (hasErrors) {
        const successCount = allResults.length;
        const failCount = failedUrls.length;

        setError(
          `⚠️ Partial Success: ${successCount} of ${validUrls.length} URLs processed successfully.\n\n` +
            `${failCount} URLs failed:\n` +
            failedUrls
              .map((failed, index) => `${index + 1}. ${failed.error}`)
              .join("\n") +
            `\n\n💡 You can still download the successful items below.`
        );
      }
    } catch (err) {
      console.error("Batch download error:", err);
      setError(`🚨 Batch download failed: ${err.message}`);
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
