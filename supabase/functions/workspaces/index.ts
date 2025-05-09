
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

    // Check if user exists in users table, if not, create them
    const { data: userRecord, error: userRecordError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
      
    if (!userRecord && !userRecordError) {
      // Create user record
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert([{ 
          id: user.id, 
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          last_login_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (createUserError) {
        console.error('Error creating user record:', createUserError);
      } else {
        console.log('Created user record:', newUser);
      }
    } else if (!userRecordError) {
      // Update last login time
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);
    }

    const url = new URL(req.url);
    const workspaceId = url.searchParams.get('id');

    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Get workspaces for the authenticated user
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching workspaces:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // If no workspaces found, create a default one
      if (!data || data.length === 0) {
        try {
          const { data: workspace, error: createError } = await supabase
            .from('workspaces')
            .insert([{ name: 'My Workspace', owner_id: user.id }])
            .select()
            .single();
            
          if (createError) throw createError;
          
          return new Response(JSON.stringify({ workspaces: [workspace] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (err) {
          console.error('Error creating default workspace:', err);
          return new Response(JSON.stringify({ error: 'Failed to create default workspace', workspaces: [] }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
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

      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert([{ name: name.trim(), owner_id: user.id }])
        .select()
        .single();

      if (workspaceError) {
        console.error('Error creating workspace:', workspaceError);
        return new Response(JSON.stringify({ error: workspaceError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ workspace }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (req.method === 'PUT') {
      // Update a workspace
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

      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .update({ name: name.trim(), updated_at: new Date().toISOString() })
        .eq('id', workspaceId)
        .eq('owner_id', user.id)
        .select()
        .single();

      if (workspaceError) {
        console.error('Error updating workspace:', workspaceError);
        return new Response(JSON.stringify({ error: workspaceError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ workspace }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (req.method === 'DELETE') {
      // Delete a workspace
      if (!workspaceId) {
        return new Response(JSON.stringify({ error: 'Workspace ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // First, check if this is the only workspace
      const { count, error: countError } = await supabase
        .from('workspaces')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);
      
      if (countError) {
        console.error('Error counting workspaces:', countError);
        return new Response(JSON.stringify({ error: countError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (count === 1) {
        return new Response(JSON.stringify({ 
          error: 'Cannot delete the only workspace. Create another workspace first.' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Delete the workspace (cascades to related data)
      const { error: deleteError } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId)
        .eq('owner_id', user.id);

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
