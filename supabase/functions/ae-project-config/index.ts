
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
    
    // Verify user has access to this project
    const { data: projectData, error: projectError } = await supabase
      .from('ae_projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();
      
    if (projectError || !projectData) {
      return new Response(JSON.stringify({ error: 'Project not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Get project configuration
      const { data, error } = await supabase
        .from('ae_project_configs')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) {
        console.error('Error fetching project configuration:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Remove sensitive values from response
      const safeConfig = { ...data };
      if (safeConfig.openai_api_key) safeConfig.openai_api_key = '••••••••';
      if (safeConfig.searchapi_api_key) safeConfig.searchapi_api_key = '••••••••';
      if (safeConfig.scrapingbee_api_key) safeConfig.scrapingbee_api_key = '••••••••';

      return new Response(JSON.stringify({ config: safeConfig }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } 
    else if (req.method === 'PUT') {
      // Update project configuration
      const updates = await req.json();
      
      // Add validation here if needed
      
      const { data, error } = await supabase
        .from('ae_project_configs')
        .update(updates)
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) {
        console.error('Error updating project configuration:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Remove sensitive values from response
      const safeConfig = { ...data };
      if (safeConfig.openai_api_key) safeConfig.openai_api_key = '••••••••';
      if (safeConfig.searchapi_api_key) safeConfig.searchapi_api_key = '••••••••';
      if (safeConfig.scrapingbee_api_key) safeConfig.scrapingbee_api_key = '••••••••';

      return new Response(JSON.stringify({ config: safeConfig }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
