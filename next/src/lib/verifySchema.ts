import { supabaseAdmin } from '@/lib/supabase-admin'

export async function verifyDatabaseSchema() {
  try {
    // Check if files table exists
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'files')

    console.log('Files table check:', { tables, tablesError })

    // Check if uploads bucket exists
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage
      .listBuckets()

    console.log('Storage buckets:', { buckets, bucketsError })

    const uploadsBucket = buckets?.find(b => b.name === 'uploads')
    
    return {
      filesTableExists: !!tables && tables.length > 0,
      uploadsBucketExists: !!uploadsBucket,
      buckets: buckets?.map(b => b.name) || []
    }
  } catch (error) {
    console.error('Schema verification error:', error)
    return {
      filesTableExists: false,
      uploadsBucketExists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Test the verification
if (require.main === module) {
  verifyDatabaseSchema().then(result => {
    console.log('Database schema verification result:', result)
  })
}