
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract JWT token from Auth header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get projectId from URL
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    
    if (!projectId) {
      return new Response(JSON.stringify({ error: 'Project ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Helper function to verify project access
    async function verifyProjectAccess(projectId: string) {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          module_type,
          workspace_id,
          workspaces!inner(owner_id)
        `)
        .eq('id', projectId)
        .eq('workspaces.owner_id', user.id)
        .single();
      
      if (error || !data) {
        throw new Error('Project not found or access denied');
      }
      
      if (data.module_type !== 'AI_ATTRIBUTE_ENRICHMENT') {
        throw new Error('Project is not an Attribute Enrichment project');
      }
      
      return data;
    }

    // Handle different HTTP methods
    if (req.method === 'GET') {
      try {
        // Verify access
        await verifyProjectAccess(projectId);
        
        // Get project settings
        const { data, error } = await supabase
          .from('ae_project_settings')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (error) {
          console.error('Error fetching project settings:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Remove sensitive values from response
        const safeSettings = { ...data };
        if (safeSettings.openai_api_key) safeSettings.openai_api_key = '••••••••';
        if (safeSettings.searchapi_api_key) safeSettings.searchapi_api_key = '••••••••';
        if (safeSettings.scrapingbee_api_key) safeSettings.scrapingbee_api_key = '••••••••';

        return new Response(JSON.stringify({ settings: safeSettings }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } 
    else if (req.method === 'PUT') {
      try {
        // Verify access
        await verifyProjectAccess(projectId);
        
        // Get update data
        const updates = await req.json();
        
        // Update project settings
        const { data, error } = await supabase
          .from('ae_project_settings')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('project_id', projectId)
          .select()
          .single();

        if (error) {
          console.error('Error updating project settings:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Remove sensitive values from response
        const safeSettings = { ...data };
        if (safeSettings.openai_api_key) safeSettings.openai_api_key = '••••••••';
        if (safeSettings.searchapi_api_key) safeSettings.searchapi_api_key = '••••••••';
        if (safeSettings.scrapingbee_api_key) safeSettings.scrapingbee_api_key = '••••••••';

        return new Response(JSON.stringify({ settings: safeSettings }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
