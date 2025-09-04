import React, { useState, useRef } from 'react';
import { Upload, X, File, DollarSign, Clock, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useFileContext } from '../context/FileContext';
import { pinataService, apiService } from '../services/api';
import { useRegisterFile, generateFileId } from '../hooks/useContract';
import { useAccount } from 'wagmi';

const FileUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    price: '',
    accessDuration: '24',
    maxDownloads: '100'
  });
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { addFile } = useFileContext();
  const { address, isConnected } = useAccount();
  const { registerFile, isLoading: isRegistering } = useRegisterFile();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.price || !isConnected) {
      setError('Please connect your wallet and select a file with price');
      return;
    }

    setUploading(true);
    setError('');
    setUploadStatus('Preparing upload...');
    
    try {
      // Step 1: Upload file to Pinata IPFS
      setUploadStatus('Uploading to IPFS...');
      const pinataResult = await pinataService.uploadFile(selectedFile, {
        name: selectedFile.name,
        creator: address,
        price: formData.price,
        keyvalues: {
          accessDuration: formData.accessDuration,
          maxDownloads: formData.maxDownloads,
        },
      });

      // Step 2: Generate unique file ID
      const fileId = generateFileId(selectedFile.name, address, Date.now());

      // Step 3: Register file on blockchain
      setUploadStatus('Registering on blockchain...');
      await registerFile(fileId, parseFloat(formData.price));

      // Step 4: Save file metadata to backend
      setUploadStatus('Saving metadata...');
      const fileData = {
        id: fileId,
        fileName: selectedFile.name,
        creatorId: address,
        price: parseFloat(formData.price),
        accessDuration: parseInt(formData.accessDuration),
        maxDownloads: parseInt(formData.maxDownloads),
        storageUrl: pinataResult.url,
        ipfsHash: pinataResult.ipfsHash,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
      };

      await apiService.createFile(fileData);
      
      // Step 5: Add to local context
      addFile(fileData);
      
      setUploadStatus('Upload completed successfully!');
      
      // Reset form after delay
      setTimeout(() => {
        setSelectedFile(null);
        setFormData({ price: '', accessDuration: '24', maxDownloads: '100' });
        setUploadStatus('');
      }, 2000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.message || 'Upload failed. Please try again.');
      setUploadStatus('');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      {!isConnected && (
        <div className="flex items-center space-x-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-orange-400" />
          <div>
            <p className="text-orange-400 font-medium">Wallet Not Connected</p>
            <p className="text-orange-300 text-sm">
              Please connect your wallet to upload and sell files.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-red-400 font-medium">Upload Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadStatus && !error && (
        <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-green-400 font-medium">Upload Status</p>
            <p className="text-green-300 text-sm">{uploadStatus}</p>
          </div>
        </div>
      )}

      {/* File Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-dark-border hover:border-dark-muted'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="*/*"
        />

        {selectedFile ? (
          <div className="flex items-center justify-center space-x-4">
            <File className="w-12 h-12 text-blue-400" />
            <div className="text-left">
              <p className="text-dark-text font-medium">{selectedFile.name}</p>
              <p className="text-dark-muted text-sm">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div>
            <Upload className="w-16 h-16 text-dark-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-text mb-2">
              Upload your file
            </h3>
            <p className="text-dark-muted mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              Choose File
            </button>
          </div>
        )}
      </div>

      {/* File Configuration */}
      {selectedFile && (
        <div className="card-dark p-6 space-y-6">
          <h3 className="text-lg font-semibold text-dark-text">
            Configure File Access
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Price (USD)
              </label>
              <input
                type="number"
                step="0.001"
                placeholder="0.050"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text placeholder-dark-muted focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Access Duration */}
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Access Duration (hours)
              </label>
              <select
                value={formData.accessDuration}
                onChange={(e) => setFormData({ ...formData, accessDuration: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text focus:border-blue-500 focus:outline-none"
              >
                <option value="1">1 hour</option>
                <option value="6">6 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="168">1 week</option>
              </select>
            </div>

            {/* Max Downloads */}
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Max Downloads
              </label>
              <input
                type="number"
                placeholder="100"
                value={formData.maxDownloads}
                onChange={(e) => setFormData({ ...formData, maxDownloads: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-dark-text placeholder-dark-muted focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !formData.price || uploading || !isConnected}
            className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              !selectedFile || !formData.price || uploading || !isConnected
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
            }`}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{uploadStatus || 'Processing...'}</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload & Publish File</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
