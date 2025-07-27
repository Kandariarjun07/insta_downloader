import { useState, useEffect } from "react";
import { Download, Link, CheckCircle, AlertTriangle } from "lucide-react";

const UrlInput = ({ url, setUrl, onDownload, isLoading, validateUrl }) => {
  const [isValid, setIsValid] = useState(null);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (url.trim()) {
      const valid = validateUrl(url.trim());
      setIsValid(valid);
      setShowValidation(true);
    } else {
      setIsValid(null);
      setShowValidation(false);
    }
  }, [url, validateUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid && !isLoading) {
      onDownload();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <div className="relative">
          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Instagram post/reel/story link here..."
            className={`input-primary pl-10 pr-20 ${
              showValidation
                ? isValid
                  ? "border-green-500 focus:ring-green-500"
                  : "border-red-500 focus:ring-red-500"
                : ""
            }`}
            disabled={isLoading}
          />

          {/* Validation Icon */}
          {showValidation && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              {isValid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}

          {/* Paste Button */}
          <button
            type="button"
            onClick={handlePaste}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            disabled={isLoading}
          >
            Paste
          </button>
        </div>

        {/* URL Validation Message */}
        {showValidation && !isValid && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            Please enter a valid Instagram post, reel, or story URL
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isValid || isLoading}
        className={`w-full btn-primary flex items-center justify-center space-x-2 ${
          !isValid || isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <Download className="w-5 h-5" />
        <span>{isLoading ? "Processing..." : "Download"}</span>
      </button>

      {/* URL Format Help */}
      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
        <p className="font-medium">Supported URL formats:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>https://instagram.com/p/[post-id]/</li>
          <li>https://instagram.com/reel/[reel-id]/ or /reels/[reel-id]/</li>
          <li>https://instagram.com/stories/[username]/[story-id]/</li>
        </ul>
      </div>
    </form>
  );
};

export default UrlInput;
