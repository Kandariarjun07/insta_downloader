# DropInsta - Instagram Downloader

A modern, responsive Instagram downloader built with React and Tailwind CSS. Download Instagram posts, reels, and stories with ease.

## ✨ Features

- **🔗 Single & Batch Downloads**: Download individual posts or multiple URLs at once
- **📱 Fully Responsive**: Mobile-first design that works on all devices
- **🌙 Dark/Light Mode**: Toggle between themes with system preference detection
- **📊 Download History**: Track and manage your download history
- **🔍 URL Validation**: Real-time validation with visual feedback
- **⚡ Progress Indicators**: Real-time download progress and status updates
- **🎨 Smooth Animations**: Beautiful transitions and loading states
- **♿ Accessible**: Built with accessibility in mind
- **🔒 Secure**: Environment-based API key management

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- RapidAPI account with Instagram Downloader API access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dropinsta-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your RapidAPI key:
   ```env
   VITE_RAPIDAPI_KEY=your_rapidapi_key_here
   VITE_RAPIDAPI_HOST=instagram-downloader-scraper-reels-igtv-posts-stories.p.rapidapi.com
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔑 API Setup

1. Go to [RapidAPI](https://rapidapi.com/instagram-scraper-api/api/instagram-downloader-scraper-reels-igtv-posts-stories)
2. Subscribe to the Instagram Downloader API
3. Copy your API key
4. Add it to your `.env` file

## 📱 Supported URLs

- Instagram Posts: `https://instagram.com/p/[post-id]/`
- Instagram Reels: `https://instagram.com/reel/[reel-id]/`
- Instagram Stories: `https://instagram.com/stories/[username]/[story-id]/`

## 🛠️ Built With

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **RapidAPI** - Instagram content API

## 📦 Project Structure

```
src/
├── components/
│   ├── Header.jsx              # App header with theme toggle
│   ├── InstagramDownloader.jsx # Main downloader component
│   ├── UrlInput.jsx           # Single URL input with validation
│   ├── BatchDownloader.jsx    # Multiple URL input
│   ├── DownloadResult.jsx     # Download results display
│   ├── DownloadHistory.jsx    # Download history management
│   ├── LoadingSkeleton.jsx    # Loading state components
│   └── ProgressIndicator.jsx  # Progress tracking
├── contexts/
│   └── ThemeContext.jsx       # Theme management
├── App.jsx                    # Main app component
├── main.jsx                   # App entry point
└── index.css                  # Global styles and Tailwind
```

## 🎨 Features in Detail

### Single Download
- Paste any Instagram URL
- Real-time URL validation
- Instant download with preview

### Batch Download
- Add multiple URLs
- Visual validation for each URL
- Process all downloads sequentially

### Download History
- Automatic history tracking
- Expandable item details
- Re-download from history
- Clear history option

### Responsive Design
- Mobile-first approach
- Touch-friendly interactions
- Optimized for all screen sizes

### Accessibility
- Keyboard navigation
- Screen reader support
- Reduced motion support
- High contrast support

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_RAPIDAPI_KEY` | Your RapidAPI key | Yes |
| `VITE_RAPIDAPI_HOST` | API host URL | Yes |

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## ⚠️ Disclaimer

This tool is for educational purposes only. Please respect Instagram's terms of service and copyright laws when downloading content.
