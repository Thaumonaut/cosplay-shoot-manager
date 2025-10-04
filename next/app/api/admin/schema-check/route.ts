import { NextRequest, NextResponse } from 'next/server'
import { verifyDatabaseSchema } from '@/lib/verifySchema'

export async function GET(req: NextRequest) {
  try {
    const result = await verifyDatabaseSchema()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Schema check error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Schema check failed' 
    }, { status: 500 })
  }
}