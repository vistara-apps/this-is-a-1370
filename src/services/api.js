import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs';

// Create API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create Pinata client
const pinataClient = axios.create({
  baseURL: PINATA_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
  },
});

// API Services
export const apiService = {
  // Creator endpoints
  async createCreator(walletAddress, email) {
    const response = await apiClient.post('/creators', {
      walletAddress,
      email,
    });
    return response.data;
  },

  async getCreator(walletAddress) {
    const response = await apiClient.get(`/creators/${walletAddress}`);
    return response.data;
  },

  // File endpoints
  async createFile(fileData) {
    const response = await apiClient.post('/files', fileData);
    return response.data;
  },

  async getFiles(creatorId) {
    const response = await apiClient.get(`/files?creatorId=${creatorId}`);
    return response.data;
  },

  async getFile(fileId) {
    const response = await apiClient.get(`/files/${fileId}`);
    return response.data;
  },

  async updateFile(fileId, updates) {
    const response = await apiClient.put(`/files/${fileId}`, updates);
    return response.data;
  },

  async deleteFile(fileId) {
    const response = await apiClient.delete(`/files/${fileId}`);
    return response.data;
  },

  // Download endpoints
  async createDownload(downloadData) {
    const response = await apiClient.post('/downloads', downloadData);
    return response.data;
  },

  async getDownloads(fileId) {
    const response = await apiClient.get(`/downloads?fileId=${fileId}`);
    return response.data;
  },

  async getCreatorDownloads(creatorId) {
    const response = await apiClient.get(`/downloads/creator/${creatorId}`);
    return response.data;
  },

  async verifyDownloadAccess(downloadId) {
    const response = await apiClient.get(`/downloads/${downloadId}/verify`);
    return response.data;
  },

  // Analytics endpoints
  async getAnalytics(creatorId, timeRange = '30d') {
    const response = await apiClient.get(`/analytics/${creatorId}?range=${timeRange}`);
    return response.data;
  },

  async getFileAnalytics(fileId, timeRange = '30d') {
    const response = await apiClient.get(`/analytics/file/${fileId}?range=${timeRange}`);
    return response.data;
  },
};

// Pinata IPFS Services
export const pinataService = {
  async uploadFile(file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const pinataMetadata = JSON.stringify({
        name: metadata.name || file.name,
        keyvalues: {
          creator: metadata.creator || 'unknown',
          price: metadata.price || '0',
          uploadedAt: new Date().toISOString(),
          ...metadata.keyvalues,
        },
      });
      
      formData.append('pinataMetadata', pinataMetadata);
      
      const pinataOptions = JSON.stringify({
        cidVersion: 1,
        customPinPolicy: {
          regions: [
            {
              id: 'FRA1',
              desiredReplicationCount: 2,
            },
            {
              id: 'NYC1',
              desiredReplicationCount: 2,
            },
          ],
        },
      });
      
      formData.append('pinataOptions', pinataOptions);

      const response = await pinataClient.post('/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        url: `${PINATA_GATEWAY_URL}/${response.data.IpfsHash}`,
      };
    } catch (error) {
      console.error('Pinata upload error:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  },

  async generateSignedUrl(ipfsHash, expirationTime = 3600) {
    try {
      const response = await pinataClient.post('/data/gateway/signedUrl', {
        ipfsHash,
        expirationTime, // in seconds
      });
      
      return response.data.signedUrl;
    } catch (error) {
      console.error('Pinata signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  },

  async getFileMetadata(ipfsHash) {
    try {
      const response = await pinataClient.get(`/data/pinList?hashContains=${ipfsHash}`);
      return response.data.rows[0] || null;
    } catch (error) {
      console.error('Pinata metadata error:', error);
      throw new Error('Failed to get file metadata');
    }
  },

  async unpinFile(ipfsHash) {
    try {
      const response = await pinataClient.delete(`/pinning/unpin/${ipfsHash}`);
      return response.data;
    } catch (error) {
      console.error('Pinata unpin error:', error);
      throw new Error('Failed to unpin file');
    }
  },
};

// Blockchain Services
export const blockchainService = {
  async verifyPayment(txHash, expectedAmount, expectedRecipient) {
    try {
      const response = await apiClient.post('/blockchain/verify-payment', {
        txHash,
        expectedAmount,
        expectedRecipient,
      });
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw new Error('Failed to verify payment');
    }
  },

  async getTransactionStatus(txHash) {
    try {
      const response = await apiClient.get(`/blockchain/transaction/${txHash}`);
      return response.data;
    } catch (error) {
      console.error('Transaction status error:', error);
      throw new Error('Failed to get transaction status');
    }
  },
};

// Error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default apiService;
