
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
        // First check if it exists in the modern projects table
        try {
          const { data: modernProject, error: modernError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('module_type', 'AI_ATTRIBUTE_ENRICHMENT')
            .maybeSingle();

          if (!modernError && modernProject) {
            console.log('Found project in modern table:', modernProject);
            return new Response(JSON.stringify({ projects: [modernProject] }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (err) {
          console.error('Error checking modern projects table:', err);
        }

        // Fallback to legacy table
        const { data, error } = await supabase
          .from('ae_projects')
          .select('*')
          .eq('id', projectId);

        if (error) {
          console.error('Error fetching project:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ projects: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // First try to get projects from the modern projects table
      try {
        const { data: modernProjects, error: modernError } = await supabase
          .from('projects')
          .select('*')
          .eq('module_type', 'AI_ATTRIBUTE_ENRICHMENT')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!modernError && modernProjects && modernProjects.length > 0) {
          console.log('Found projects in modern table:', modernProjects.length);
          return new Response(JSON.stringify({ projects: modernProjects }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (err) {
        console.error('Error checking modern projects table:', err);
      }

      // Fallback to legacy projects table
      const { data, error } = await supabase
        .from('ae_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ projects: data }), {
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
          
          const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert([{ 
              name, 
              workspace_id, 
              module_type: 'AI_ATTRIBUTE_ENRICHMENT' 
            }])
            .select()
            .single();

          if (!projectError) {
            console.log('Created project in modern table:', project);
            
            // Create default settings for the project
            await supabase
              .from('ae_project_settings')
              .insert([{ project_id: project.id }]);
              
            return new Response(JSON.stringify({ project }), {
              status: 201,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (err) {
        console.error('Error creating in modern projects table:', err);
      }

      // Fallback to legacy table
      const { data: project, error: projectError } = await supabase
        .from('ae_projects')
        .insert([{ name, user_id: user.id }])
        .select()
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        return new Response(JSON.stringify({ error: projectError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create default configuration for the new project
      const { error: configError } = await supabase
        .from('ae_project_configs')
        .insert([{ project_id: project.id }]);

      if (configError) {
        console.error('Error creating project configuration:', configError);
        return new Response(JSON.stringify({ error: configError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

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
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
