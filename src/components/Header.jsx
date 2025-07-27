import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const Header = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/20 dark:border-white/10 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4 animate-slide-right">
            <div className="w-12 h-12 bg-gradient-to-br from-instagram-purple via-primary-500 to-instagram-pink rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 neon-glow">
              <img
                src="/icon.png"
                alt="DropInsta Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <span
                className="text-white font-bold text-lg hidden animate-bounce-in"
                style={{ display: "none" }}
              >
                DI
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-black gradient-text">DropInsta</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block font-medium">
                ⚡ Lightning Fast Downloads
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 dark:from-black/20 dark:to-black/10 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:from-white/30 hover:to-white/20 dark:hover:from-black/30 dark:hover:to-black/20 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-300/50 group animate-slide-left"
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? (
              <Sun className="w-6 h-6 text-accent-400 group-hover:text-accent-300 transition-colors duration-300 group-hover:rotate-180 transform transition-transform duration-500" />
            ) : (
              <Moon className="w-6 h-6 text-primary-600 group-hover:text-primary-500 transition-colors duration-300 group-hover:-rotate-12 transform transition-transform duration-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
