import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    // Create uploads bucket if it doesn't exist
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const uploadsBucket = buckets?.find((b: any) => b.name === 'uploads')
    
    if (!uploadsBucket) {
      const { data: newBucket, error: bucketError } = await supabaseAdmin.storage
        .createBucket('uploads', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 10485760 // 10MB
        })
      
      if (bucketError) {
        return NextResponse.json({ 
          error: 'Failed to create uploads bucket: ' + bucketError.message 
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        message: 'Uploads bucket created successfully',
        bucket: newBucket 
      })
    }
    
    return NextResponse.json({ 
      message: 'Uploads bucket already exists' 
    })
    
  } catch (error) {
    console.error('Bucket creation error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create bucket' 
    }, { status: 500 })
  }
}