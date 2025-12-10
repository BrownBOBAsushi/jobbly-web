// components/onboarding/DragAndDropUpload.tsx
'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaFileAlt, FaTimesCircle } from 'react-icons/fa';

interface DragAndDropUploadProps {
  label: string;
  subTitle: string;
  accept: string; // Still accepts extensions string (e.g., ".pdf,.docx")
  multiple: boolean;
  onFileChange: (files: File[]) => void;
  currentFiles: File[];
  maxSize: number; // in bytes
}

// Helper to map file extensions (user-friendly) to proper MIME types (dropzone-friendly)
const getAcceptMimeTypes = (acceptString: string) => {
  const types: Record<string, string[]> = {};
  // Common MIME type mapping
  const mimeMap: { [key: string]: string } = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  };

  acceptString.split(',').forEach(ext => {
    const mime = mimeMap[ext.trim().toLowerCase()];
    if (mime) {
      types[mime] = [];
    }
  });
  return Object.keys(types).length > 0 ? types : undefined;
};


export const DragAndDropUpload: React.FC<DragAndDropUploadProps> = ({
  label,
  subTitle,
  accept,
  multiple,
  onFileChange,
  currentFiles,
  maxSize,
}) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);
    if (fileRejections.length > 0) {
      setError(`One or more files exceed the maximum size of ${maxSize / 1024 / 1024}MB.`);
      return;
    }

    if (multiple) {
      onFileChange([...currentFiles, ...acceptedFiles]);
    } else {
      // For single file upload, replace the current one
      onFileChange(acceptedFiles.slice(0, 1));
    }
  }, [currentFiles, multiple, onFileChange, maxSize]);

  const acceptedTypes = getAcceptMimeTypes(accept); 
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes, // Correctly uses MIME types
    maxSize,
    multiple,
  });

  const removeFile = (fileToRemove: File) => {
    onFileChange(currentFiles.filter(f => f !== fileToRemove));
  };
  
  const showDropzoneContent = multiple || currentFiles.length === 0;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {showDropzoneContent && (
        <div
          {...getRootProps()}
          className={`
            flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl 
            cursor-pointer transition-colors duration-200 
            ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}
          `}
        >
          <input {...getInputProps()} />
          <FaUpload className="w-8 h-8 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-600">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">{subTitle}</p>
        </div>
      )}

      {/* File List / Error display */}
      <div className="mt-2 space-y-2">
        {error && (
          <p className="text-sm text-red-600 font-medium flex items-center">
            <FaTimesCircle className="w-4 h-4 mr-2" />
            {error}
          </p>
        )}

        {currentFiles.map((file, index) => (
          <div
            key={file.name + index}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white shadow-sm"
          >
            <div className="flex items-center min-w-0">
              <FaFileAlt className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
            </div>
            <button
              onClick={() => removeFile(file)}
              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              title="Remove file"
            >
              <FaTimesCircle className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};