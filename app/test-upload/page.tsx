'use client'

import { useState } from 'react'
import FileUploader from '@/components/FileUploader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DevOnlyWrapper from '@/components/DevOnlyWrapper'

export default function TestUploadPage() {
  const [schemaStatus, setSchemaStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkSchema = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/schema-check')
      const data = await response.json()
      setSchemaStatus(data)
    } catch (error) {
      console.error('Schema check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupStorage = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/setup-storage', { method: 'POST' })
      const data = await response.json()
      console.log('Storage setup result:', data)
      // Refresh schema status
      await checkSchema()
    } catch (error) {
      console.error('Storage setup failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DevOnlyWrapper pageName="File Upload Test">
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">File Upload Test</h1>
        <div className="flex gap-2">
          <Button onClick={checkSchema} disabled={loading}>
            Check Schema
          </Button>
          <Button onClick={setupStorage} disabled={loading}>
            Setup Storage
          </Button>
        </div>
      </div>

      {schemaStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Database Schema Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Files table exists: {schemaStatus.filesTableExists ? '✅' : '❌'}</p>
              <p>Uploads bucket exists: {schemaStatus.uploadsBucketExists ? '✅' : '❌'}</p>
              {schemaStatus.buckets && (
                <p>Available buckets: {schemaStatus.buckets.join(', ')}</p>
              )}
              {schemaStatus.error && (
                <p className="text-red-500">Error: {schemaStatus.error}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test File Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploader
            accept="image/*"
            multiple={true}
            onUpload={(files) => {
              console.log('Files uploaded:', files)
              alert(`Successfully uploaded ${files.length} file(s)`)
            }}
            onDelete={(fileId) => {
              console.log('File deleted:', fileId)
              alert('File deleted successfully')
            }}
          />
        </CardContent>
      </Card>
      </div>
    </DevOnlyWrapper>
  )
}