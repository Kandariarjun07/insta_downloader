// API Configuration utility
export const getApiConfig = () => {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  const apiHost = import.meta.env.VITE_RAPIDAPI_HOST;
  
  if (!apiKey || apiKey === 'your_rapidapi_key_here') {
    throw new Error('API key not configured. Please set up your RapidAPI key in the environment variables. Check the README for setup instructions.');
  }
  
  if (!apiHost) {
    throw new Error('API host not configured. Please check your environment variables.');
  }
  
  return {
    apiKey,
    apiHost,
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': apiHost
    }
  };
};

export const buildApiUrl = (url) => {
  const { apiHost } = getApiConfig();
  return `https://${apiHost}/scraper?url=${encodeURIComponent(url)}`;
};
