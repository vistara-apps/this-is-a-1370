import React, { useState } from 'react';
import { useFileContext } from '../context/FileContext';
import FileCard from '../components/FileCard';
import { Search, Filter, Grid, List } from 'lucide-react';

const Marketplace = () => {
  const { files } = useFileContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  // Filter out current user's files in a real app
  const marketplaceFiles = files.filter(file => true); // Show all for demo

  const filteredFiles = marketplaceFiles
    .filter(file => 
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'popular':
          return b.downloadCount - a.downloadCount;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-2">Marketplace</h1>
        <p className="text-dark-muted">Discover and purchase digital files from creators</p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-3 text-dark-muted" />
          <input
            type="text"
            placeholder="Search marketplace..."
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
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
          
          <button className="bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-dark-muted hover:text-dark-text transition-colors">
            <Filter className="w-5 h-5" />
          </button>
          
          <div className="flex border border-dark-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-dark-surface text-dark-muted'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-dark-surface text-dark-muted'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="card-dark p-6">
        <h2 className="text-xl font-semibold text-dark-text mb-4">Featured Files</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredFiles.slice(0, 3).map((file) => (
            <div key={file.id} className="bg-dark-bg rounded-lg p-4 border border-dark-border">
              <h3 className="text-dark-text font-medium mb-2 truncate">{file.fileName}</h3>
              <div className="flex justify-between items-center">
                <span className="text-blue-400 font-bold">${file.price.toFixed(3)}</span>
                <span className="text-dark-muted text-sm">{file.downloadCount} downloads</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Files Grid/List */}
      {filteredFiles.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {filteredFiles.map((file) => (
            <FileCard key={file.id} file={file} variant="buyerView" />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-dark-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-dark-muted" />
          </div>
          <h3 className="text-xl font-semibold text-dark-text mb-2">No files found</h3>
          <p className="text-dark-muted">Try adjusting your search terms or filters</p>
        </div>
      )}

      {/* Categories */}
      <div className="card-dark p-6">
        <h2 className="text-xl font-semibold text-dark-text mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'Documents', 'Images', 'Audio', 'Video', 
            'Ebooks', 'Templates', 'Courses', 'Software'
          ].map((category) => (
            <button
              key={category}
              className="bg-dark-bg border border-dark-border rounded-lg p-4 text-center hover:border-blue-500 transition-colors"
            >
              <span className="text-dark-text font-medium">{category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;