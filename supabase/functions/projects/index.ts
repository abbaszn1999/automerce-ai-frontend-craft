
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

    // Handle different HTTP methods
    if (req.method === 'GET') {
      // If projectId is specified, get a specific project
      if (projectId) {
        console.log(`Fetching project with ID: ${projectId}`);
        
        // Query the projects table
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
        
        if (projectError) {
          console.error('Error fetching project:', projectError);
          
          // If the project isn't found in the standard table, check legacy table
          try {
            const { data: legacyData, error: legacyError } = await supabase
              .from('ae_projects')
              .select('*')
              .eq('id', projectId)
              .single();
              
            if (legacyError) throw legacyError;
            
            console.log('Found project in legacy table:', legacyData);
            return new Response(JSON.stringify({ project: legacyData }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } catch (legacyErr) {
            console.error('Error fetching from legacy table:', legacyErr);
            return new Response(JSON.stringify({ error: 'Project not found' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
        
        console.log('Found project:', projectData);
        return new Response(JSON.stringify({ project: projectData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } 
      
      // Get projects with optional filters
      console.log('Fetching projects with filters:', { workspaceId, moduleType });
      
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }
      
      if (moduleType) {
        query = query.eq('module_type', moduleType);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching projects:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log(`Found ${data.length} projects`);
      return new Response(JSON.stringify({ projects: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } 
    else if (req.method === 'POST') {
      // Create a new project
      const body = await req.json();
      const { name, workspace_id, module_type } = body;
      
      if (!name) {
        return new Response(JSON.stringify({ error: 'Project name is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (!workspace_id) {
        return new Response(JSON.stringify({ error: 'Workspace ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (!module_type) {
        return new Response(JSON.stringify({ error: 'Module type is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

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
      
      console.log('Project created:', project);

      // If this is an AE project, create default settings
      if (module_type === 'AI_ATTRIBUTE_ENRICHMENT') {
        const { error: settingsError } = await supabase
          .from('ae_project_settings')
          .insert([{ project_id: project.id }]);

        if (settingsError) {
          console.error('Error creating AE project settings:', settingsError);
          // Don't return error, just log it - the project was created successfully
        }
      }

      return new Response(JSON.stringify({ project }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (req.method === 'PUT') {
      if (!projectId) {
        return new Response(JSON.stringify({ error: 'Project ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const body = await req.json();
      
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .update(body)
        .eq('id', projectId)
        .select()
        .single();

      if (projectError) {
        console.error('Error updating project:', projectError);
        return new Response(JSON.stringify({ error: projectError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ project }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (req.method === 'DELETE') {
      if (!projectId) {
        return new Response(JSON.stringify({ error: 'Project ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (projectError) {
        console.error('Error deleting project:', projectError);
        return new Response(JSON.stringify({ error: projectError.message }), {
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
