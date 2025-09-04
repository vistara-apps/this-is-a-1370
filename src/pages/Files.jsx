import React, { useState } from 'react';
import { useFileContext } from '../context/FileContext';
import FileCard from '../components/FileCard';
import { Search, Filter, SortAsc } from 'lucide-react';

const Files = () => {
  const { files } = useFileContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filteredFiles = files
    .filter(file => 
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price-high':
          return b.price - a.price;
        case 'price-low':
          return a.price - b.price;
        case 'downloads':
          return b.downloadCount - a.downloadCount;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-2">My Files</h1>
        <p className="text-dark-muted">Manage your uploaded files and track performance</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-3 text-dark-muted" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-surface border border-dark-border rounded-lg pl-10 pr-4 py-2 text-dark-text placeholder-dark-muted focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-dark-text focus:border-blue-500 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="downloads">Most Downloads</option>
          </select>
          
          <button className="bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-dark-muted hover:text-dark-text transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file) => (
            <FileCard key={file.id} file={file} variant="creatorView" />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-dark-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <SortAsc className="w-8 h-8 text-dark-muted" />
          </div>
          <h3 className="text-xl font-semibold text-dark-text mb-2">
            {searchTerm ? 'No files found' : 'No files uploaded yet'}
          </h3>
          <p className="text-dark-muted mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Upload your first file to start monetizing your content'
            }
          </p>
          {!searchTerm && (
            <button className="btn-primary">
              Upload Your First File
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Files;