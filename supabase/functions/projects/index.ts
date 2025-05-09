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
      return new Response(JSON.stringify({ error: 'Invalid token', details: userError?.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const workspaceId = url.searchParams.get('workspaceId');
    const moduleType = url.searchParams.get('moduleType');

    // Handle different HTTP methods
    if (req.method === 'GET') {
      console.log('[projects] GET request with params:', { id, workspaceId, moduleType });
      
      // If ID is provided, fetch a specific project
      if (id) {
        console.log(`[projects] Fetching project with ID: ${id}`);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('[projects] Error fetching project:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!data) {
          console.log('[projects] Project not found');
          return new Response(JSON.stringify({ error: 'Project not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('[projects] Project found:', data);
        return new Response(JSON.stringify({ project: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Otherwise, fetch all projects based on filters
      let query = supabase
        .from('projects')
        .select('*');

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
        console.log(`[projects] Filtering by workspace_id: ${workspaceId}`);
      }

      if (moduleType) {
        query = query.eq('module_type', moduleType);
        console.log(`[projects] Filtering by module_type: ${moduleType}`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('[projects] Error fetching projects:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`[projects] Found ${data?.length || 0} projects`);
      return new Response(JSON.stringify({ projects: data || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } 
    else if (req.method === 'POST') {
      // Create a new project
      const body = await req.json();
      const { name, workspace_id, module_type } = body;
      
      if (!name || !workspace_id || !module_type) {
        console.error('[projects] Missing required fields for project creation:', { name, workspace_id, module_type });
        return new Response(JSON.stringify({ error: 'Name, workspace_id, and module_type are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('[projects] Creating new project:', { name, workspace_id, module_type });

      // Verify workspace exists and user has access
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id, owner_id')
        .eq('id', workspace_id)
        .single();

      if (workspaceError || !workspace) {
        console.error('[projects] Workspace not found or access denied:', workspaceError);
        return new Response(JSON.stringify({ error: 'Workspace not found or access denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{ 
          name, 
          workspace_id, 
          module_type,
          user_id: user.id  // For backwards compatibility
        }])
        .select()
        .single();

      if (projectError) {
        console.error('[projects] Error creating project:', projectError);
        return new Response(JSON.stringify({ error: projectError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Handle module-specific setup
      if (module_type === 'AI_ATTRIBUTE_ENRICHMENT') {
        try {
          // Create default settings for AE projects
          const { error: settingsError } = await supabase
            .from('ae_project_settings')
            .insert([{ project_id: project.id }]);
            
          if (settingsError) {
            console.error('[projects] Error creating AE settings:', settingsError);
            // Don't fail the whole request if this fails
          }
        } catch (err) {
          console.error('[projects] Error in AE-specific setup:', err);
        }
      }

      console.log('[projects] Project created successfully:', project);
      return new Response(JSON.stringify({ project }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (req.method === 'PUT') {
      // Update a project
      if (!id) {
        return new Response(JSON.stringify({ error: 'Project ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const updates = await req.json();
      
      if (Object.keys(updates).length === 0) {
        return new Response(JSON.stringify({ error: 'No update data provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`[projects] Updating project ${id} with:`, updates);

      // Verify project exists and user has access
      const { data: existingProject, error: checkError } = await supabase
        .from('projects')
        .select('id, workspace_id')
        .eq('id', id)
        .maybeSingle();

      if (checkError || !existingProject) {
        console.error('[projects] Project not found or access denied:', checkError);
        return new Response(JSON.stringify({ error: 'Project not found or access denied' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify workspace access if this project belongs to a workspace
      if (existingProject.workspace_id) {
        const { data: workspace, error: workspaceError } = await supabase
          .from('workspaces')
          .select('owner_id')
          .eq('id', existingProject.workspace_id)
          .maybeSingle();

        if (workspaceError || !workspace || workspace.owner_id !== user.id) {
          console.error('[projects] Workspace access denied:', workspaceError);
          return new Response(JSON.stringify({ error: 'Access denied to this project' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Update the project
      const { data: project, error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('[projects] Error updating project:', updateError);
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('[projects] Project updated successfully:', project);
      return new Response(JSON.stringify({ project }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (req.method === 'DELETE') {
      // Delete a project
      if (!id) {
        return new Response(JSON.stringify({ error: 'Project ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`[projects] Deleting project with ID: ${id}`);

      // Verify project exists and user has access
      const { data: existingProject, error: checkError } = await supabase
        .from('projects')
        .select('id, workspace_id')
        .eq('id', id)
        .maybeSingle();

      if (checkError || !existingProject) {
        console.error('[projects] Project not found or access denied:', checkError);
        return new Response(JSON.stringify({ error: 'Project not found or access denied' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify workspace access if this project belongs to a workspace
      if (existingProject.workspace_id) {
        const { data: workspace, error: workspaceError } = await supabase
          .from('workspaces')
          .select('owner_id')
          .eq('id', existingProject.workspace_id)
          .maybeSingle();

        if (workspaceError || !workspace || workspace.owner_id !== user.id) {
          console.error('[projects] Workspace access denied:', workspaceError);
          return new Response(JSON.stringify({ error: 'Access denied to this project' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Delete the project
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('[projects] Error deleting project:', deleteError);
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('[projects] Project deleted successfully');
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
  } catch (error: any) {
    console.error('[projects] Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
