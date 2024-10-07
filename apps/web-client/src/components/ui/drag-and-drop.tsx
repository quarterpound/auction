import { Asset } from '@prisma/client'
import { LoaderCircle, Upload, X } from 'lucide-react'
import {useDropzone} from 'react-dropzone'
import { Button } from './button'
import { MAX_UPLOAD_SIZE } from 'server/router/uploads/validator';
import { uploadFile } from '@/lib/files';
import { useState } from 'react';
import Image from 'next/image'

interface DragAndDropProps {
  files: Asset[]
  onChange: (files: Asset[]) => void
}

const DragAndDrop = ({ files, onChange }: DragAndDropProps) => {

  const [isUploading, setIsUploading] = useState(false)
  const { getRootProps, isDragActive, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 12,
    maxSize: MAX_UPLOAD_SIZE,
    onDropAccepted: (acceptedFiles) => {
      const files = acceptedFiles;
      setIsUploading(true)
      Promise.all(files.map(file => uploadFile(file)))
        .then((assets) => {
          onChange(assets)
        })
        .finally(() => {
          setIsUploading(false)
        })
    },
    onDropRejected: (rejectedFiles) => {
      console.log(rejectedFiles)
    },
  })


  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <div className='grid gap-2'>
          {
            isUploading ? (
              <LoaderCircle className='mx-auto h-12 w-12 text-gray-400 animate-spin' />
            ) : (
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
            )
          }
          <p className="mt-2 text-sm text-gray-600">
            {`Drag 'n' drop some files here, or click to select files`}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            (Only images files are accepted)
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="mt-6 space-y-4">
          {files.map(file => (
            <li key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <Image
                  src={file.url}
                  width={file.width}
                  height={file.height}
                  alt={file.id.toString()}
                  className="h-10 w-10 object-cover rounded"
                />
                <span className="text-sm truncate">{file.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  type='button'
                  onClick={() => onChange(files.filter(f => f.id !== file.id))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DragAndDrop
