'use client'

import React, { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Upload, X, File, Image } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadedFile {
  id: string
  filename: string
  url: string
  type: string
  size: number
}

interface FileUploaderProps {
  onUpload?: (files: UploadedFile[]) => void
  onDelete?: (fileId: string) => void
  accept?: string
  maxSize?: number
  multiple?: boolean
  className?: string
  disabled?: boolean
}

export function FileUploader({
  onUpload,
  onDelete,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  className,
  disabled = false
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File) => {
    if (file.size > maxSize) {
      throw new Error(`File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}.`)
    }

    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      throw new Error(`File "${file.name}" has an invalid type.`)
    }
  }

  const uploadFiles = async (files: FileList) => {
    if (!files.length || disabled) return

    setUploading(true)
    const newUploadedFiles: UploadedFile[] = []

    try {
      for (const file of Array.from(files)) {
        validateFile(file)

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/files', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const uploadedFile = await response.json()
        newUploadedFiles.push(uploadedFile)
      }

      setUploadedFiles(prev => [...prev, ...newUploadedFiles])
      onUpload?.(newUploadedFiles)

    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(e.target.files)
    }
  }

  const handleRemoveFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files?id=${fileId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete file')
      }

      setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
      onDelete?.(fileId)

    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete file')
    }
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          dragActive
            ? 'border-primary bg-primary/10'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-muted-foreground">
              {accept.includes('image') ? 'Images' : 'Files'} up to {formatFileSize(maxSize)}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading || disabled}
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </Button>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-muted/25"
              >
                {file.type.startsWith('image/') ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded">
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                    <File className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(file.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUploader