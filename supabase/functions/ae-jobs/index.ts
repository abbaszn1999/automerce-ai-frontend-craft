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
      const jobId = url.searchParams.get('jobId');
      
      // If jobId provided, get specific job with logs
      if (jobId) {
        const { data: job, error: jobError } = await supabase
          .from('ae_jobs')
          .select(`
            id, 
            name, 
            status, 
            progress, 
            current_stage, 
            stage_progress, 
            eta, 
            is_paused, 
            created_at, 
            updated_at, 
            completed_at, 
            error
          `)
          .eq('id', jobId)
          .eq('project_id', projectId)
          .single();
          
        if (jobError) {
          return new Response(JSON.stringify({ error: 'Job not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Get logs for job
        const { data: logs, error: logsError } = await supabase
          .from('ae_job_logs')
          .select('id, message, level, created_at')
          .eq('job_id', jobId)
          .order('created_at', { ascending: true });
          
        if (logsError) {
          console.error('Error fetching job logs:', logsError);
          return new Response(JSON.stringify({ error: logsError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        return new Response(JSON.stringify({ job, logs }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } 
      // Otherwise get all jobs for the project
      else {
        const { data: jobs, error } = await supabase
          .from('ae_jobs')
          .select('id, name, status, progress, current_stage, created_at, completed_at')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching jobs:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ jobs }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } 
    else if (req.method === 'POST') {
      // Create a new job
      const { name } = await req.json();
      
      const { data: job, error } = await supabase
        .from('ae_jobs')
        .insert([{ 
          name, 
          project_id: projectId
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating job:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Add initial log entry
      await supabase
        .from('ae_job_logs')
        .insert([{
          job_id: job.id,
          message: 'Job created and ready for input data',
          level: 'info'
        }]);

      return new Response(JSON.stringify({ job }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (req.method === 'PUT') {
      // Update job status (pause, resume, cancel)
      const jobId = url.searchParams.get('jobId');
      const { action } = await req.json();
      
      if (!jobId) {
        return new Response(JSON.stringify({ error: 'Job ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (!['pause', 'resume', 'cancel'].includes(action)) {
        return new Response(JSON.stringify({ error: 'Invalid action. Must be one of: pause, resume, cancel' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Verify job belongs to the specified project
      const { data: jobData, error: jobError } = await supabase
        .from('ae_jobs')
        .select('id, status, is_paused')
        .eq('id', jobId)
        .eq('project_id', projectId)
        .single();
        
      if (jobError || !jobData) {
        return new Response(JSON.stringify({ error: 'Job not found or access denied' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      let updateData = {};
      let logMessage = '';
      
      if (action === 'pause') {
        updateData = { is_paused: true };
        logMessage = 'Job paused by user';
      } else if (action === 'resume') {
        updateData = { is_paused: false };
        logMessage = 'Job resumed by user';
      } else if (action === 'cancel') {
        updateData = { 
          status: 'cancelled',
          is_paused: false,
          completed_at: new Date().toISOString()
        };
        logMessage = 'Job cancelled by user';
      }
      
      // Update job status
      const { data: updatedJob, error: updateError } = await supabase
        .from('ae_jobs')
        .update(updateData)
        .eq('id', jobId)
        .select()
        .single();
        
      if (updateError) {
        console.error(`Error ${action}ing job:`, updateError);
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Add log entry
      await supabase
        .from('ae_job_logs')
        .insert([{
          job_id: jobId,
          message: logMessage,
          level: 'info'
        }]);
        
      return new Response(JSON.stringify({ job: updatedJob }), {
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
