import { useState, useEffect } from "react";
import Header from "./components/Header";
import InstagramDownloader from "./components/InstagramDownloader";
import DownloadHistory from "./components/DownloadHistory";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  const [downloadHistory, setDownloadHistory] = useState([]);

  // Load download history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("dropinsta-history");
    if (savedHistory) {
      try {
        setDownloadHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Error loading download history:", error);
      }
    }
  }, []);

  // Save download history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("dropinsta-history", JSON.stringify(downloadHistory));
  }, [downloadHistory]);

  const addToHistory = (downloadData) => {
    const historyItem = {
      id: Date.now(),
      url: downloadData.url,
      timestamp: new Date().toISOString(),
      items: downloadData.items,
      status: "completed",
    };

    setDownloadHistory((prev) => [historyItem, ...prev.slice(0, 49)]); // Keep only last 50 items
  };

  const clearHistory = () => {
    setDownloadHistory([]);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-light-bg via-primary-50/30 to-secondary-50/30 dark:from-dark-bg dark:via-dark-surface/50 dark:to-primary-900/20 transition-all duration-500">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-instagram-pink/20 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary-400/20 to-instagram-purple/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-accent-400/10 to-instagram-orange/10 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <Header />

        <main className="relative pt-24 pb-12 px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center animate-bounce-in">
              <div className="inline-block mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-instagram-purple to-instagram-pink rounded-2xl flex items-center justify-center shadow-2xl animate-float neon-glow">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-black mb-6 animate-slide-up">
                <span className="gradient-text">Drop</span>
                <span className="text-gray-900 dark:text-white">Insta</span>
              </h1>

              <p
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                🚀 Download Instagram posts, reels, and stories with
                <span className="gradient-text font-semibold">
                  {" "}
                  lightning speed
                </span>
                . Paste your link below and watch the magic happen! ✨
              </p>

              <div
                className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 animate-slide-up"
                style={{ animationDelay: "0.4s" }}
              >
                <span className="flex items-center gap-2 bg-white/50 dark:bg-dark-card/50 px-4 py-2 rounded-full backdrop-blur-sm">
                  📱 Posts
                </span>
                <span className="flex items-center gap-2 bg-white/50 dark:bg-dark-card/50 px-4 py-2 rounded-full backdrop-blur-sm">
                  🎬 Reels
                </span>
                <span className="flex items-center gap-2 bg-white/50 dark:bg-dark-card/50 px-4 py-2 rounded-full backdrop-blur-sm">
                  📖 Stories
                </span>
                <span className="flex items-center gap-2 bg-white/50 dark:bg-dark-card/50 px-4 py-2 rounded-full backdrop-blur-sm">
                  ⚡ Batch Download
                </span>
              </div>
            </div>

            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.6s" }}
            >
              <InstagramDownloader onDownloadComplete={addToHistory} />
            </div>

            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.8s" }}
            >
              <DownloadHistory
                history={downloadHistory}
                onClearHistory={clearHistory}
              />
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
