
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
    
    // Get parameters from URL
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    const jobId = url.searchParams.get('jobId');
    
    // Helper function to verify project access
    async function verifyProjectAccess(projectId: string) {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          module_type,
          workspace_id,
          workspaces!inner(owner_id)
        `)
        .eq('id', projectId)
        .eq('workspaces.owner_id', user.id)
        .single();
      
      if (error || !data) {
        throw new Error('Project not found or access denied');
      }
      
      if (data.module_type !== 'AI_ATTRIBUTE_ENRICHMENT') {
        throw new Error('Project is not an Attribute Enrichment project');
      }
      
      return data;
    }

    // Helper function to verify job belongs to project
    async function verifyJobAccess(jobId: string, projectId: string) {
      const { data, error } = await supabase
        .from('ae_jobs')
        .select('id')
        .eq('id', jobId)
        .eq('project_id', projectId)
        .single();
      
      if (error || !data) {
        throw new Error('Job not found or does not belong to this project');
      }
      
      return data;
    }

    // Helper function to log job message
    async function logJobMessage(jobId: string, message: string, level = 'info') {
      await supabase
        .from('ae_job_logs')
        .insert([{ job_id: jobId, message, level }]);
    }

    // Handle different HTTP methods
    if (req.method === 'GET') {
      if (jobId) {
        try {
          // Get specific job with logs
          const { data: job, error: jobError } = await supabase
            .from('ae_jobs')
            .select('*')
            .eq('id', jobId)
            .single();
          
          if (jobError) {
            console.error('Error fetching job:', jobError);
            return new Response(JSON.stringify({ error: jobError.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          // Verify the user has access to this job's project
          try {
            await verifyProjectAccess(job.project_id);
          } catch (error) {
            return new Response(JSON.stringify({ error: 'Access denied' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          // Get logs for this job
          const { data: logs, error: logsError } = await supabase
            .from('ae_job_logs')
            .select('*')
            .eq('job_id', jobId)
            .order('created_at', { ascending: true });
          
          if (logsError) {
            console.error('Error fetching job logs:', logsError);
            // Continue even if logs fetch fails
          }
          
          return new Response(JSON.stringify({ job, logs: logs || [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Error in job fetch:', error);
          return new Response(JSON.stringify({ error: 'An error occurred fetching job details' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else if (projectId) {
        try {
          // Verify access
          await verifyProjectAccess(projectId);
          
          // List jobs for this project
          const { data: jobs, error } = await supabase
            .from('ae_jobs')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching jobs:', error);
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({ jobs: jobs || [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        return new Response(JSON.stringify({ error: 'Project ID or Job ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } 
    else if (req.method === 'POST') {
      if (!projectId) {
        return new Response(JSON.stringify({ error: 'Project ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        // Verify access
        await verifyProjectAccess(projectId);
        
        const { name, inputData } = await req.json();
        
        if (!inputData || !inputData.products || !Array.isArray(inputData.products) || inputData.products.length === 0) {
          return new Response(JSON.stringify({ error: 'Input data with products array is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Create job
        const { data: job, error: jobError } = await supabase
          .from('ae_jobs')
          .insert([{ project_id: projectId, name: name || `Job ${new Date().toISOString()}` }])
          .select()
          .single();

        if (jobError) {
          console.error('Error creating job:', jobError);
          return new Response(JSON.stringify({ error: jobError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Log job creation
        await logJobMessage(job.id, 'Job created and queued for processing');
        
        // Create input product records
        const inputProducts = inputData.products.map((product: any) => ({
          job_id: job.id,
          record_id: product.id || `rec-${Math.random().toString(36).substr(2, 9)}`,
          title: product.title || 'Untitled Product',
          description: product.description || '',
          url: product.url || '',
          image_url: product.image_url || ''
        }));

        const { error: productsError } = await supabase
          .from('ae_input_products')
          .insert(inputProducts);

        if (productsError) {
          console.error('Error adding input products:', productsError);
          await logJobMessage(job.id, 'Error adding input products', 'error');
          
          // Update job status
          await supabase
            .from('ae_jobs')
            .update({ 
              status: 'failed',
              error: 'Failed to process input products',
              updated_at: new Date().toISOString()
            })
            .eq('id', job.id);
            
          return new Response(JSON.stringify({ error: productsError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update job status to processing
        const { error: updateError } = await supabase
          .from('ae_jobs')
          .update({ 
            status: 'processing',
            current_stage: 'processing_input',
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);

        if (updateError) {
          console.error('Error updating job status:', updateError);
        }
        
        // Log processing start
        await logJobMessage(job.id, `Processing started for ${inputProducts.length} products`);

        // TODO: In a real implementation, this would trigger an async processing workflow
        // For now, we'll just return the job and simulate progress

        return new Response(JSON.stringify({ job }), {
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
      if (!jobId || !projectId) {
        return new Response(JSON.stringify({ error: 'Project ID and Job ID are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        // Verify access
        await verifyProjectAccess(projectId);
        await verifyJobAccess(jobId, projectId);
        
        const { action } = await req.json();
        
        if (!action || !['pause', 'resume', 'cancel'].includes(action)) {
          return new Response(JSON.stringify({ error: 'Valid action (pause, resume, cancel) is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Perform requested action
        let updateData = {};
        let logMessage = '';
        
        switch (action) {
          case 'pause':
            updateData = { 
              is_paused: true,
              updated_at: new Date().toISOString()
            };
            logMessage = 'Job paused by user';
            break;
          case 'resume':
            updateData = { 
              is_paused: false,
              updated_at: new Date().toISOString()
            };
            logMessage = 'Job resumed by user';
            break;
          case 'cancel':
            updateData = { 
              status: 'cancelled',
              updated_at: new Date().toISOString(),
              completed_at: new Date().toISOString()
            };
            logMessage = 'Job cancelled by user';
            break;
        }

        // Update job
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

        // Log the action
        await logJobMessage(jobId, logMessage);

        return new Response(JSON.stringify({ job: updatedJob }), {
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
