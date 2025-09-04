import React, { useState, useEffect } from 'react';
import { Download, Clock, AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { format, formatDistanceToNow, isAfter } from 'date-fns';

const AccessLink = ({ 
  downloadUrl, 
  expiresAt, 
  maxDownloads, 
  currentDownloads = 0,
  variant = 'generated',
  onDownload,
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Update time remaining every second
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      
      if (isAfter(now, expiry)) {
        setIsExpired(true);
        setTimeRemaining('Expired');
      } else {
        setIsExpired(false);
        setTimeRemaining(formatDistanceToNow(expiry, { addSuffix: true }));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleCopyLink = async () => {
    if (!downloadUrl) return;
    
    try {
      await navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl || isExpired || currentDownloads >= maxDownloads) return;
    
    setIsDownloading(true);
    
    try {
      // Track download
      if (onDownload) {
        await onDownload();
      }
      
      // Open download link
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusColor = () => {
    if (variant === 'expired' || isExpired) return 'text-red-400';
    if (currentDownloads >= maxDownloads) return 'text-orange-400';
    return 'text-green-400';
  };

  const getStatusIcon = () => {
    if (variant === 'expired' || isExpired) return <AlertCircle className="w-4 h-4" />;
    if (currentDownloads >= maxDownloads) return <AlertCircle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (variant === 'expired' || isExpired) return 'Link Expired';
    if (currentDownloads >= maxDownloads) return 'Download Limit Reached';
    return 'Active';
  };

  const canDownload = !isExpired && currentDownloads < maxDownloads && downloadUrl;

  return (
    <div className={`card-dark p-4 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Download className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-dark-text">Download Access</h3>
        </div>
        <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      {/* Access Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Time Remaining */}
        <div className="flex items-center space-x-3 p-3 bg-dark-bg rounded-lg">
          <Clock className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-sm text-dark-muted">Time Remaining</p>
            <p className={`font-medium ${isExpired ? 'text-red-400' : 'text-dark-text'}`}>
              {timeRemaining || 'Loading...'}
            </p>
            {expiresAt && (
              <p className="text-xs text-dark-muted">
                Expires: {format(new Date(expiresAt), 'MMM dd, yyyy HH:mm')}
              </p>
            )}
          </div>
        </div>

        {/* Download Count */}
        <div className="flex items-center space-x-3 p-3 bg-dark-bg rounded-lg">
          <Download className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-sm text-dark-muted">Downloads</p>
            <p className="font-medium text-dark-text">
              {currentDownloads} / {maxDownloads}
            </p>
            <p className="text-xs text-dark-muted">
              {maxDownloads - currentDownloads} remaining
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-dark-muted">Usage</span>
          <span className="text-dark-text">
            {Math.round((currentDownloads / maxDownloads) * 100)}%
          </span>
        </div>
        <div className="w-full bg-dark-bg rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              currentDownloads >= maxDownloads
                ? 'bg-red-500'
                : currentDownloads / maxDownloads > 0.8
                ? 'bg-orange-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((currentDownloads / maxDownloads) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={!canDownload || isDownloading}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            canDownload && !isDownloading
              ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </>
          )}
        </button>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          disabled={!downloadUrl}
          className="flex items-center justify-center space-x-2 py-3 px-4 bg-dark-surface border border-dark-border text-dark-text rounded-lg font-medium hover:bg-dark-bg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        {/* Open in New Tab Button */}
        {downloadUrl && (
          <button
            onClick={() => window.open(downloadUrl, '_blank')}
            disabled={!canDownload}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-dark-surface border border-dark-border text-dark-text rounded-lg font-medium hover:bg-dark-bg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open</span>
          </button>
        )}
      </div>

      {/* Warning Messages */}
      {isExpired && (
        <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-red-400 font-medium">Access Expired</p>
            <p className="text-red-300 text-sm">
              This download link has expired and is no longer valid.
            </p>
          </div>
        </div>
      )}

      {currentDownloads >= maxDownloads && !isExpired && (
        <div className="flex items-center space-x-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-orange-400" />
          <div>
            <p className="text-orange-400 font-medium">Download Limit Reached</p>
            <p className="text-orange-300 text-sm">
              Maximum number of downloads has been reached for this file.
            </p>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="text-xs text-dark-muted p-3 bg-dark-bg rounded-lg">
        <p className="flex items-center space-x-1">
          <span>🔒</span>
          <span>
            This is a secure, time-limited download link. Do not share this link as it may expire or reach its download limit.
          </span>
        </p>
      </div>
    </div>
  );
};

export default AccessLink;
