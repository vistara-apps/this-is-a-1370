import React, { useState } from 'react';
import { Download, Eye, Calendar, DollarSign, Users, Clock } from 'lucide-react';
import PaymentButton from './PaymentButton';
import { useFileContext } from '../context/FileContext';

const FileCard = ({ file, variant = 'creatorView' }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { addDownload } = useFileContext();

  const handlePurchaseComplete = () => {
    // Simulate successful purchase
    const download = {
      id: Date.now().toString(),
      fileId: file.id,
      fileName: file.fileName,
      buyerWalletAddress: '0x1234...5678',
      downloadedAt: new Date(),
      amount: file.price
    };
    addDownload(download);
  };

  if (variant === 'creatorView') {
    return (
      <div className="card-dark p-6 hover:scale-105 transition-transform duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-dark-text mb-2 truncate">
              {file.fileName}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-dark-muted">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>${file.price.toFixed(3)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>{file.downloadCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{file.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-dark-muted hover:text-dark-text"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-green-400">
            ${file.earnings.toFixed(2)}
          </div>
          <div className="text-sm text-dark-muted">
            Total Earnings
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-dark-border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-dark-muted" />
                <span>Max Downloads: {file.maxDownloads}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-dark-muted" />
                <span>Access: {file.accessDuration}h</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Buyer view for marketplace
  return (
    <div className="card-dark p-6 hover:scale-105 transition-transform duration-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-dark-text mb-2">
          {file.fileName}
        </h3>
        <div className="flex items-center justify-between text-sm text-dark-muted">
          <div className="flex items-center space-x-1">
            <Download className="w-4 h-4" />
            <span>{file.downloadCount} downloads</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{file.accessDuration}h access</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-400">
          ${file.price.toFixed(3)}
        </div>
        <PaymentButton 
          amount={file.price} 
          onSuccess={handlePurchaseComplete}
          variant="crypto"
        />
      </div>
    </div>
  );
};

export default FileCard;