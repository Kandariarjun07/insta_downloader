// API Configuration utility
export const getApiConfig = () => {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  const apiHost = import.meta.env.VITE_RAPIDAPI_HOST;

  // Better error handling for missing environment variables
  if (
    !apiKey ||
    apiKey === "undefined" ||
    apiKey === "your_rapidapi_key_here" ||
    apiKey.trim() === ""
  ) {
    throw new Error(
      "🔑 API key not configured properly. Please check your Netlify environment variables:\n" +
        "1. Go to your Netlify dashboard\n" +
        "2. Navigate to Site settings > Environment variables\n" +
        "3. Add VITE_RAPIDAPI_KEY with your RapidAPI key\n" +
        "4. Redeploy your site"
    );
  }

  if (!apiHost || apiHost === "undefined" || apiHost.trim() === "") {
    throw new Error(
      "🌐 API host not configured properly. Please check your Netlify environment variables:\n" +
        "1. Add VITE_RAPIDAPI_HOST with your RapidAPI host\n" +
        "2. Redeploy your site"
    );
  }

  return {
    apiKey: apiKey.trim(),
    apiHost: apiHost.trim(),
    headers: {
      "x-rapidapi-key": apiKey.trim(),
      "x-rapidapi-host": apiHost.trim(),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
};

export const buildApiUrl = (url) => {
  try {
    const { apiHost } = getApiConfig();
    const cleanUrl = url.trim();

    // Validate URL format
    if (!cleanUrl.startsWith("http")) {
      throw new Error("Invalid URL format");
    }

    return `https://${apiHost}/scraper?url=${encodeURIComponent(cleanUrl)}`;
  } catch (error) {
    console.error("Error building API URL:", error);
    throw error;
  }
};
