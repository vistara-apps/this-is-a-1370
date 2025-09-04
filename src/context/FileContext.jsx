import React, { createContext, useContext, useState, useEffect } from 'react';

const FileContext = createContext();

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};

export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [earnings, setEarnings] = useState(0);

  // Mock data for demonstration
  useEffect(() => {
    const mockFiles = [
      {
        id: '1',
        fileName: 'Digital Marketing Guide.pdf',
        price: 0.05,
        maxDownloads: 100,
        accessDuration: 24,
        downloadCount: 23,
        createdAt: new Date('2024-01-15'),
        storageUrl: 'https://example.com/file1',
        earnings: 1.15
      },
      {
        id: '2',
        fileName: 'React Components Pack.zip',
        price: 0.10,
        maxDownloads: 50,
        accessDuration: 48,
        downloadCount: 12,
        createdAt: new Date('2024-01-10'),
        storageUrl: 'https://example.com/file2',
        earnings: 1.20
      },
      {
        id: '3',
        fileName: 'Photography Presets.zip',
        price: 0.08,
        maxDownloads: 75,
        accessDuration: 24,
        downloadCount: 8,
        createdAt: new Date('2024-01-20'),
        storageUrl: 'https://example.com/file3',
        earnings: 0.64
      }
    ];

    const mockDownloads = [
      {
        id: '1',
        fileId: '1',
        fileName: 'Digital Marketing Guide.pdf',
        buyerWalletAddress: '0x1234...5678',
        downloadedAt: new Date('2024-01-22'),
        amount: 0.05
      },
      {
        id: '2',
        fileId: '2',
        fileName: 'React Components Pack.zip',
        buyerWalletAddress: '0x8765...4321',
        downloadedAt: new Date('2024-01-21'),
        amount: 0.10
      }
    ];

    setFiles(mockFiles);
    setDownloads(mockDownloads);
    setEarnings(mockFiles.reduce((total, file) => total + file.earnings, 0));
  }, []);

  const addFile = (file) => {
    const newFile = {
      ...file,
      id: Date.now().toString(),
      downloadCount: 0,
      createdAt: new Date(),
      earnings: 0
    };
    setFiles(prev => [...prev, newFile]);
  };

  const addDownload = (download) => {
    setDownloads(prev => [...prev, download]);
    // Update file download count and earnings
    setFiles(prev => prev.map(file => 
      file.id === download.fileId 
        ? { 
            ...file, 
            downloadCount: file.downloadCount + 1,
            earnings: file.earnings + download.amount
          }
        : file
    ));
    setEarnings(prev => prev + download.amount);
  };

  return (
    <FileContext.Provider value={{
      files,
      downloads,
      earnings,
      addFile,
      addDownload,
      totalFiles: files.length,
      totalDownloads: downloads.length
    }}>
      {children}
    </FileContext.Provider>
  );
};