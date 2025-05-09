
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
    const projectId = url.searchParams.get('projectId');

    // Handle different HTTP methods
    if (req.method === 'GET') {
      // If projectId is provided, fetch a specific project
      if (projectId) {
        console.log(`[ae-projects] Fetching project with ID: ${projectId}`);
        // First check if it exists in the modern projects table
        try {
          const { data: modernProject, error: modernError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('module_type', 'AI_ATTRIBUTE_ENRICHMENT')
            .maybeSingle();

          if (!modernError && modernProject) {
            console.log('[ae-projects] Found project in modern table:', modernProject);
            return new Response(JSON.stringify({ projects: [modernProject] }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } else if (modernError) {
            console.error('[ae-projects] Error checking modern projects table:', modernError);
          }
        } catch (err) {
          console.error('[ae-projects] Error checking modern projects table:', err);
        }

        // Fallback to legacy table
        try {
          console.log('[ae-projects] Checking legacy table for project');
          const { data, error } = await supabase
            .from('ae_projects')
            .select('*')
            .eq('id', projectId)
            .maybeSingle();

          if (error) {
            console.error('[ae-projects] Error fetching project from legacy table:', error);
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          if (!data) {
            console.log('[ae-projects] Project not found in any table');
            return new Response(JSON.stringify({ error: 'Project not found' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          console.log('[ae-projects] Found project in legacy table:', data);
          return new Response(JSON.stringify({ projects: [data] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (err) {
          console.error('[ae-projects] Error fetching from legacy table:', err);
          return new Response(JSON.stringify({ error: 'Failed to fetch project' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // First try to get projects from the modern projects table
      try {
        console.log('[ae-projects] Fetching all projects for user:', user.id);
        const { data: modernProjects, error: modernError } = await supabase
          .from('projects')
          .select('*')
          .eq('module_type', 'AI_ATTRIBUTE_ENRICHMENT')
          .order('created_at', { ascending: false });

        if (!modernError && modernProjects && modernProjects.length > 0) {
          console.log('[ae-projects] Found projects in modern table:', modernProjects.length);
          return new Response(JSON.stringify({ projects: modernProjects }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (err) {
        console.error('[ae-projects] Error checking modern projects table:', err);
      }

      // Fallback to legacy projects table
      const { data, error } = await supabase
        .from('ae_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ae-projects] Error fetching projects from legacy table:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('[ae-projects] Found projects in legacy table:', data?.length || 0);
      return new Response(JSON.stringify({ projects: data || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } 
    else if (req.method === 'POST') {
      // Create a new project
      const { name } = await req.json();
      
      if (!name) {
        return new Response(JSON.stringify({ error: 'Project name is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('[ae-projects] Creating new project:', name);

      // First try to create in the modern projects table if workspace_id is available
      try {
        // Get user's default workspace
        const { data: workspaces, error: workspaceError } = await supabase
          .from('workspaces')
          .select('id')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1);
          
        if (!workspaceError && workspaces && workspaces.length > 0) {
          const workspace_id = workspaces[0].id;
          console.log(`[ae-projects] Using workspace: ${workspace_id} for new project`);
          
          const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert([{ 
              name, 
              workspace_id, 
              module_type: 'AI_ATTRIBUTE_ENRICHMENT',
              user_id: user.id  // Include user_id for compatibility
            }])
            .select()
            .single();

          if (!projectError && project) {
            console.log('[ae-projects] Created project in modern table:', project);
            
            // Create default settings for the project
            try {
              await supabase
                .from('ae_project_settings')
                .insert([{ project_id: project.id }]);
            } catch (settingErr) {
              console.error('[ae-projects] Error creating default settings:', settingErr);
              // Continue anyway as this is not critical
            }
              
            return new Response(JSON.stringify({ project }), {
              status: 201,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } else {
            console.error('[ae-projects] Error creating project in modern table:', projectError);
          }
        } else {
          console.warn('[ae-projects] No workspace found for user:', user.id);
        }
      } catch (err) {
        console.error('[ae-projects] Error creating in modern projects table:', err);
      }

      // Fallback to legacy table
      const { data: project, error: projectError } = await supabase
        .from('ae_projects')
        .insert([{ name, user_id: user.id }])
        .select()
        .single();

      if (projectError) {
        console.error('[ae-projects] Error creating project in legacy table:', projectError);
        return new Response(JSON.stringify({ error: projectError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create default configuration for the new project
      try {
        const { error: configError } = await supabase
          .from('ae_project_configs')
          .insert([{ project_id: project.id }]);

        if (configError) {
          console.error('[ae-projects] Error creating project configuration:', configError);
          // Continue anyway as we've already created the project
        }
      } catch (err) {
        console.error('[ae-projects] Error creating project configuration:', err);
      }

      console.log('[ae-projects] Created project in legacy table:', project);
      return new Response(JSON.stringify({ project }), {
        status: 201,
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
    console.error('[ae-projects] Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
