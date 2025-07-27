import { useState, useEffect } from 'react'
import Header from './components/Header'
import InstagramDownloader from './components/InstagramDownloader'
import DownloadHistory from './components/DownloadHistory'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  const [downloadHistory, setDownloadHistory] = useState([])

  // Load download history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('dropinsta-history')
    if (savedHistory) {
      try {
        setDownloadHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Error loading download history:', error)
      }
    }
  }, [])

  // Save download history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dropinsta-history', JSON.stringify(downloadHistory))
  }, [downloadHistory])

  const addToHistory = (downloadData) => {
    const historyItem = {
      id: Date.now(),
      url: downloadData.url,
      timestamp: new Date().toISOString(),
      items: downloadData.items,
      status: 'completed'
    }
    
    setDownloadHistory(prev => [historyItem, ...prev.slice(0, 49)]) // Keep only last 50 items
  }

  const clearHistory = () => {
    setDownloadHistory([])
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
        <Header />
        
        <main className="pt-20 pb-8 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Instagram Downloader
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Download Instagram posts, reels, and stories quickly and easily. 
                Paste your link below to get started.
              </p>
            </div>

            <InstagramDownloader onDownloadComplete={addToHistory} />
            
            <DownloadHistory 
              history={downloadHistory} 
              onClearHistory={clearHistory}
            />
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
