'use client';

import React, { useRef, useState } from 'react';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isDisabled?: boolean;
}

export default function FileUploadZone({ onFileSelect, selectedFile }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const validateAndPassFile = (file: File) => {
    // Basic validation: Check size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert("File is too large! Max 5MB.");
      return;
    }
    onFileSelect(file);
  };

  // If a file is already selected, show the "File Selected" state
  if (selectedFile) {
    return (
      <div className="border-2 border-green-500 bg-green-50 rounded-lg p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* File Icon SVG */}
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <button 
          onClick={() => inputRef.current?.click()}
          className="text-sm text-green-700 hover:text-green-800 font-medium underline"
        >
          Change
        </button>
        {/* Hidden input for changing file */}
        <input type="file" ref={inputRef} onChange={handleChange} className="hidden" accept=".pdf,.docx,.txt" />
      </div>
    );
  }

  // Default "Upload" state
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
      `}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleChange} 
        className="hidden" 
        accept=".pdf,.docx,.txt"
      />
      
      {/* Cloud Icon SVG */}
      <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>

      <p className="mt-2 text-sm font-semibold text-gray-900">
        Click to upload or drag and drop
      </p>
      <p className="mt-1 text-xs text-gray-500">
        PDF, DOCX, TXT (max 5MB)
      </p>
    </div>
  );
}