import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const body = await req.json().catch(() => ({}))
    const { action, commit_sha, commit_message, branch, triggered_by } = body

    console.log('GitHub Sync Triggered:', { action, commit_sha, branch, triggered_by })

    // Log the sync action to audit logs
    const { error: logError } = await supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: null,
        admin_email: triggered_by || 'github-actions',
        action: 'GITHUB_SYNC',
        details: {
          commit_sha,
          commit_message,
          branch,
          triggered_by,
          action,
          timestamp: new Date().toISOString(),
        },
        ip_address: req.headers.get('x-forwarded-for') || 'github-actions',
      })

    if (logError) {
      console.error('Failed to log audit entry:', logError)
    }

    // Sync products if schema file was updated
    if (action === 'sync_products' || action === 'github_push_sync') {
      // Update sync timestamp
      const { error: syncError } = await supabase
        .from('system_settings')
        .upsert({
          key: 'last_github_sync',
          value: {
            timestamp: new Date().toISOString(),
            commit_sha,
            commit_message,
            triggered_by,
          },
          updated_at: new Date().toISOString(),
        })

      if (syncError) {
        console.error('Failed to update sync timestamp:', syncError)
      }

      // Trigger real-time notification to connected clients
      await supabase.channel('admin-sync').send({
        type: 'broadcast',
        event: 'database_sync',
        payload: {
          message: 'Database synced from GitHub',
          timestamp: new Date().toISOString(),
          commit_sha,
          triggered_by,
        },
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sync completed successfully',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in github-sync function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
