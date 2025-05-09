
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
      if (workspaceId) {
        // Get specific workspace
        const { data, error } = await supabase
          .from('workspaces')
          .select('*')
          .eq('id', workspaceId)
          .eq('owner_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching workspace:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: error.code === 'PGRST116' ? 404 : 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ workspace: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        // Get all workspaces for this user
        const { data, error } = await supabase
          .from('workspaces')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

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
    } else if (req.method === 'POST') {
      // Create a new workspace
      const { name } = await req.json();
      
      if (!name || name.trim() === '') {
        return new Response(JSON.stringify({ error: 'Workspace name is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create a profile record if it doesn't exist
      const { data: existingUser, error: existingUserError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (existingUserError && existingUserError.code !== 'PGRST116') {
        console.error('Error checking user:', existingUserError);
        return new Response(JSON.stringify({ error: 'Failed to check user profile' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // If user profile doesn't exist, create it
      if (!existingUser) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([{ 
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
            last_login_at: new Date().toISOString()
          }]);
          
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          return new Response(JSON.stringify({ error: 'Failed to create user profile' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Create workspace
      const { data, error } = await supabase
        .from('workspaces')
        .insert([{ name, owner_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating workspace:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create default configurations for the new workspace
      const promises = [
        supabase
          .from('workspace_analytics_configs')
          .insert([{ workspace_id: data.id }]),
        supabase
          .from('workspace_js_configs')
          .insert([{ workspace_id: data.id }]),
        supabase
          .from('workspace_feed_configs')
          .insert([{ workspace_id: data.id }])
      ];

      const results = await Promise.allSettled(promises);
      const errors = results
        .filter(result => result.status === 'rejected')
        .map(result => (result as PromiseRejectedResult).reason);

      if (errors.length > 0) {
        console.error('Error creating workspace configurations:', errors);
        // We'll still return success but log the errors
      }

      return new Response(JSON.stringify({ workspace: data }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (req.method === 'PUT') {
      if (!workspaceId) {
        return new Response(JSON.stringify({ error: 'Workspace ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const { name } = await req.json();
      
      if (!name || name.trim() === '') {
        return new Response(JSON.stringify({ error: 'Workspace name is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update workspace
      const { data, error } = await supabase
        .from('workspaces')
        .update({ 
          name,
          updated_at: new Date().toISOString()
        })
        .eq('id', workspaceId)
        .eq('owner_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating workspace:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ workspace: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (req.method === 'DELETE') {
      if (!workspaceId) {
        return new Response(JSON.stringify({ error: 'Workspace ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Delete workspace
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId)
        .eq('owner_id', user.id);

      if (error) {
        console.error('Error deleting workspace:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
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
