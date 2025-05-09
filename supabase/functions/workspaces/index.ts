
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

    const url = new URL(req.url);
    const workspaceId = url.searchParams.get('id');

    // Handle different HTTP methods
    if (req.method === 'GET') {
      let query = supabase.from('workspaces').select('*').eq('owner_id', user.id);
      
      if (workspaceId) {
        query = query.eq('id', workspaceId).single();
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching workspaces:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ workspaces: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } 
    else if (req.method === 'POST') {
      // Create a new workspace
      const { name } = await req.json();
      
      if (!name) {
        return new Response(JSON.stringify({ error: 'Workspace name is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Insert workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert([{ name, owner_id: user.id }])
        .select()
        .single();

      if (workspaceError) {
        console.error('Error creating workspace:', workspaceError);
        return new Response(JSON.stringify({ error: workspaceError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create default workspace configurations
      const workspaceId = workspace.id;
      
      // Create analytics config
      const { error: analyticsError } = await supabase
        .from('workspace_analytics_configs')
        .insert([{ workspace_id: workspaceId }]);

      if (analyticsError) {
        console.error('Error creating analytics config:', analyticsError);
      }

      // Create JS config
      const { error: jsError } = await supabase
        .from('workspace_js_configs')
        .insert([{ workspace_id: workspaceId }]);

      if (jsError) {
        console.error('Error creating JS config:', jsError);
      }

      // Create feed config
      const { error: feedError } = await supabase
        .from('workspace_feed_configs')
        .insert([{ workspace_id: workspaceId }]);

      if (feedError) {
        console.error('Error creating feed config:', feedError);
      }

      return new Response(JSON.stringify({ workspace }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (req.method === 'PUT') {
      if (!workspaceId) {
        return new Response(JSON.stringify({ error: 'Workspace ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const { name } = await req.json();
      
      if (!name) {
        return new Response(JSON.stringify({ error: 'Workspace name is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify user has access to this workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id')
        .eq('id', workspaceId)
        .eq('owner_id', user.id)
        .single();
        
      if (workspaceError || !workspaceData) {
        return new Response(JSON.stringify({ error: 'Workspace not found or access denied' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update workspace
      const { data: updatedWorkspace, error: updateError } = await supabase
        .from('workspaces')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', workspaceId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating workspace:', updateError);
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ workspace: updatedWorkspace }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (req.method === 'DELETE') {
      if (!workspaceId) {
        return new Response(JSON.stringify({ error: 'Workspace ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify user has access to this workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id')
        .eq('id', workspaceId)
        .eq('owner_id', user.id)
        .single();
        
      if (workspaceError || !workspaceData) {
        return new Response(JSON.stringify({ error: 'Workspace not found or access denied' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Delete workspace - cascading delete will remove all related data
      const { error: deleteError } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (deleteError) {
        console.error('Error deleting workspace:', deleteError);
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
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
