import { useState } from 'react';
import { Download, Package, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

const ZipDownloadProgress = ({ 
  isVisible, 
  onClose, 
  progress, 
  total, 
  status, 
  message,
  estimatedSize 
}) => {
  if (!isVisible) return null;

  const progressPercentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  const getStatusIcon = () => {
    switch (status) {
      case 'downloading':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'creating':
        return <Package className="w-6 h-6 text-purple-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Download className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'downloading':
        return 'from-blue-500 to-cyan-500';
      case 'creating':
        return 'from-purple-500 to-pink-500';
      case 'success':
        return 'from-green-500 to-emerald-500';
      case 'error':
        return 'from-red-500 to-orange-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border max-w-md w-full p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              ZIP Download
            </h3>
          </div>
          
          {(status === 'success' || status === 'error') && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getStatusColor()} transition-all duration-500 ease-out`}
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="h-full bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {message || 'Preparing download...'}
          </p>
          
          {total > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {progress} of {total} items • Est. size: {estimatedSize}
            </p>
          )}
        </div>

        {/* Status-specific content */}
        {status === 'downloading' && (
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span className="text-sm font-medium">Downloading media files...</span>
          </div>
        )}

        {status === 'creating' && (
          <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
            <Package className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">Creating ZIP archive...</span>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Download Complete!</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Your ZIP file has been downloaded successfully.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Download Failed</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {message || 'An error occurred while creating the ZIP file.'}
            </p>
            
            <button
              onClick={onClose}
              className="mt-3 btn-secondary text-sm py-2 px-4"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZipDownloadProgress;
