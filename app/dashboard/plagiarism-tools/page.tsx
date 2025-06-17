// app/page.tsx (untuk App Router)
'use client'
import React, { useState } from 'react';
import { CloudUploadIcon } from '@heroicons/react/outline'; // Pastikan Heroicons terinstal (npm install @heroicons/react)

export default function PlagiarismPage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFileType, setSelectedFileType] = useState('transparentPng'); // Default active section
  const [isUploaded, setIsUploaded] = useState<Boolean>(false)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
    // logic here
    console.log('Dropped files:', files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
    console.log('Selected files:', files);
  };

  const uploadFiles = () => {
    return true
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row mt-6 px-6 gap-6">
        {/* Left Section: File Upload and List */}
        <div className="w-full bg-white p-6 rounded-lg shadow-md">
          {/* Info Bar */}
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
            <p className="font-bold">Do not submit generative AI content with titles that imply an actual depiction of newsworthy events. <a href="#" className="text-yellow-800 underline">More info</a>.</p>
          </div>

          {/* Success Message */}
          {isUploaded && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                <p className="font-bold">Your files were successfully submitted</p>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative w-full h-80 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500
              ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
            `}
          >
            <CloudUploadIcon className="h-20 w-20 text-blue-500 mb-4" />
            <p className="text-lg font-semibold">Drag & Drop files or</p>
            <input
              type="file"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
            />
            <button className="mt-2 text-blue-600 font-bold hover:underline">
              Browse
            </button>
          </div>

          {/* Uploaded Files Preview (basic placeholder) */}
          {uploadedFiles.length > 0 && (
            <div className="mt-8">
                <div className='flex gap-4 mb-4'>
                    <h3 className="text-lg font-semibold mb-4 w-1/5">
                        Uploaded Files ({uploadedFiles.length})
                    </h3>
                    <div className='flex-grow-1 w-4/5'>
                        <button className='p-2 w-[100px] bg-teal-500 text-white font-bold rounded-md hover:bg-teal-600' onChange={uploadFiles}>Submit</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-md bg-white shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-800 truncate">{file.name}</span>
                    </div>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}