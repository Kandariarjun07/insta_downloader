import { Plus, Trash2, Download } from "lucide-react";

const BatchDownloader = ({ urls, setUrls, onDownload, isLoading }) => {
  const addUrlField = () => {
    setUrls([...urls, ""]);
  };

  const removeUrlField = (index) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const updateUrl = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const validateInstagramUrl = (url) => {
    const instagramRegex =
      /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reels?|stories)\/[\w-]+\/?/;
    return instagramRegex.test(url);
  };

  const validUrls = urls.filter(
    (url) => url.trim() && validateInstagramUrl(url.trim())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Batch Download
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {validUrls.length} valid URL{validUrls.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {urls.map((url, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="url"
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                placeholder={`Instagram URL ${index + 1}...`}
                className={`input-primary ${
                  url.trim() && !validateInstagramUrl(url.trim())
                    ? "border-red-500 focus:ring-red-500"
                    : url.trim() && validateInstagramUrl(url.trim())
                    ? "border-green-500 focus:ring-green-500"
                    : ""
                }`}
                disabled={isLoading}
              />
              {url.trim() && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validateInstagramUrl(url.trim()) ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              )}
            </div>

            {urls.length > 1 && (
              <button
                type="button"
                onClick={() => removeUrlField(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={addUrlField}
          className="flex items-center space-x-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
          <span>Add URL</span>
        </button>

        <button
          onClick={onDownload}
          disabled={validUrls.length === 0 || isLoading}
          className={`flex-1 btn-primary flex items-center justify-center space-x-3 group/btn ${
            validUrls.length === 0 || isLoading
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <Download className="w-6 h-6 group-hover/btn:animate-bounce" />
          <span className="font-bold">
            {isLoading
              ? "⚡ Processing..."
              : `🚀 Download ${validUrls.length} item${
                  validUrls.length !== 1 ? "s" : ""
                }`}
          </span>
        </button>
      </div>

      {validUrls.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="font-medium mb-1">Ready to download:</p>
          <ul className="space-y-1">
            {validUrls.slice(0, 3).map((url, index) => (
              <li key={index} className="truncate">
                {index + 1}. {url}
              </li>
            ))}
            {validUrls.length > 3 && (
              <li className="text-gray-400">
                ... and {validUrls.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BatchDownloader;
