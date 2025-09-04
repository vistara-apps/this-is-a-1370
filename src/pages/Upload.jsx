import React from 'react';
import FileUpload from '../components/FileUpload';

const Upload = () => {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-text mb-2">Upload File</h1>
        <p className="text-dark-muted">
          Upload and configure your digital files for monetization
        </p>
      </div>

      <FileUpload />
    </div>
  );
};

export default Upload;