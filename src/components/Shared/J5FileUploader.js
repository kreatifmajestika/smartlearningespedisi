'use client'
import { useState } from 'react'
import { uploadFile } from '../../lib/storageHelper'

const FileUploader = ({ multiple = false, onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false)
  
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    setIsUploading(true)
    
    try {
      const uploadPromises = files.map(file => uploadFile(file))
      const uploadedFiles = await Promise.all(uploadPromises)
      onUploadSuccess(uploadedFiles)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
      <input
        type="file"
        id="file-upload"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <label
        htmlFor="file-upload"
        className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
      >
        <div className="flex flex-col items-center justify-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-1 text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Upload files
            </span>{' '}
            or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            {multiple ? 'Multiple files supported' : 'Single file only'}
          </p>
        </div>
      </label>
      {isUploading && (
        <div className="mt-2 text-sm text-gray-500">Uploading...</div>
      )}
    </div>
  )
}

export default FileUploader