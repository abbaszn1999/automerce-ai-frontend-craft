
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
    const projectId = url.searchParams.get('id');
    const workspaceId = url.searchParams.get('workspaceId');
    const moduleType = url.searchParams.get('moduleType');

    // Helper function to verify workspace access
    async function verifyWorkspaceAccess(workspaceId: string) {
      const { data, error } = await supabase
        .from('workspaces')
        .select('id')
        .eq('id', workspaceId)
        .eq('owner_id', user.id)
        .single();
      
      if (error || !data) {
        throw new Error('Workspace not found or access denied');
      }
      
      return data;
    }

    // Helper function to verify project access
    async function verifyProjectAccess(projectId: string) {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          workspace_id,
          workspaces!inner(owner_id)
        `)
        .eq('id', projectId)
        .eq('workspaces.owner_id', user.id)
        .single();
      
      if (error || !data) {
        throw new Error('Project not found or access denied');
      }
      
      return data;
    }

    // Handle different HTTP methods
    if (req.method === 'GET') {
      if (projectId) {
        // Get specific project
        try {
          await verifyProjectAccess(projectId);
          
          // Get project with join to its module-specific settings
          const { data, error } = await supabase
            .from('projects')
            .select(`
              *,
              ae_project_settings(*)
            `)
            .eq('id', projectId)
            .single();

          if (error) {
            console.error('Error fetching project:', error);
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({ project: data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        // List projects, filtered by workspace and/or module type
        let query = supabase
          .from('projects')
          .select(`
            *,
            workspaces!inner(owner_id)
          `)
          .eq('workspaces.owner_id', user.id);
        
        if (workspaceId) {
          query = query.eq('workspace_id', workspaceId);
        }

        if (moduleType) {
          query = query.eq('module_type', moduleType);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching projects:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Filter out the nested workspace data before returning
        const projects = data.map(project => {
          const { workspaces, ...projectData } = project;
          return projectData;
        });

        return new Response(JSON.stringify({ projects }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } 
    else if (req.method === 'POST') {
      const { name, workspace_id, module_type } = await req.json();
      
      if (!name || !workspace_id || !module_type) {
        return new Response(JSON.stringify({ error: 'Name, workspace ID, and module type are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        // Verify user has access to the workspace
        await verifyWorkspaceAccess(workspace_id);
        
        // Create project
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .insert([{ name, workspace_id, module_type }])
          .select()
          .single();

        if (projectError) {
          console.error('Error creating project:', projectError);
          return new Response(JSON.stringify({ error: projectError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Create module-specific settings based on module_type
        if (module_type === 'AI_ATTRIBUTE_ENRICHMENT') {
          const { error: settingsError } = await supabase
            .from('ae_project_settings')
            .insert([{ project_id: project.id }]);

          if (settingsError) {
            console.error('Error creating AE project settings:', settingsError);
            // Don't fail the request if settings creation fails
          }
        }
        // Add similar blocks for other module types as needed

        return new Response(JSON.stringify({ project }), {
          status: 201,
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
      if (!projectId) {
        return new Response(JSON.stringify({ error: 'Project ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const updates = await req.json();
      
      try {
        // Verify user has access to the project
        await verifyProjectAccess(projectId);

        // Update project
        const { data: updatedProject, error: updateError } = await supabase
          .from('projects')
          .update({ 
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating project:', updateError);
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ project: updatedProject }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    else if (req.method === 'DELETE') {
      if (!projectId) {
        return new Response(JSON.stringify({ error: 'Project ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        // Verify user has access to the project
        await verifyProjectAccess(projectId);

        // Delete project - cascading delete will handle related data
        const { error: deleteError } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId);

        if (deleteError) {
          console.error('Error deleting project:', deleteError);
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
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
