
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
    const attributeId = url.searchParams.get('attributeId');
    
    if (!projectId) {
      return new Response(JSON.stringify({ error: 'Project ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
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

    // Helper function to verify attribute belongs to project
    async function verifyAttributeAccess(attributeId: string, projectId: string) {
      const { data, error } = await supabase
        .from('ae_managed_attributes')
        .select('id')
        .eq('id', attributeId)
        .eq('project_id', projectId)
        .single();
      
      if (error || !data) {
        throw new Error('Attribute not found or does not belong to this project');
      }
      
      return data;
    }

    // Handle different HTTP methods
    if (req.method === 'GET') {
      try {
        // Verify access
        await verifyProjectAccess(projectId);
        
        // Get attributes for this project, with their values
        const { data, error } = await supabase
          .from('ae_managed_attributes')
          .select(`
            *,
            ae_attribute_values(*)
          `)
          .eq('project_id', projectId)
          .order('created_at', { foreignTable: 'ae_attribute_values' });

        if (error) {
          console.error('Error fetching attributes:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ attributes: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } 
    else if (req.method === 'POST') {
      try {
        // Verify access
        await verifyProjectAccess(projectId);
        
        const { name, description, values = [] } = await req.json();
        
        if (!name) {
          return new Response(JSON.stringify({ error: 'Attribute name is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Create attribute
        const { data: attribute, error: attributeError } = await supabase
          .from('ae_managed_attributes')
          .insert([{ name, description, project_id: projectId }])
          .select()
          .single();

        if (attributeError) {
          console.error('Error creating attribute:', attributeError);
          return new Response(JSON.stringify({ error: attributeError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Add attribute values if provided
        if (values.length > 0) {
          const attributeValues = values.map((value: string) => ({
            attribute_id: attribute.id,
            value
          }));

          const { error: valuesError } = await supabase
            .from('ae_attribute_values')
            .insert(attributeValues);

          if (valuesError) {
            console.error('Error adding attribute values:', valuesError);
            // Continue even if values insertion fails
          }
        }

        // Fetch the complete attribute with its values
        const { data: completeAttribute, error: fetchError } = await supabase
          .from('ae_managed_attributes')
          .select(`
            *,
            ae_attribute_values(*)
          `)
          .eq('id', attribute.id)
          .single();

        if (fetchError) {
          console.error('Error fetching complete attribute:', fetchError);
          return new Response(JSON.stringify({ attribute }), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ attribute: completeAttribute }), {
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
      if (!attributeId) {
        return new Response(JSON.stringify({ error: 'Attribute ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        // Verify access
        await verifyProjectAccess(projectId);
        await verifyAttributeAccess(attributeId, projectId);
        
        const { name, description, values = [] } = await req.json();
        
        if (!name) {
          return new Response(JSON.stringify({ error: 'Attribute name is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update attribute
        const { data: attribute, error: attributeError } = await supabase
          .from('ae_managed_attributes')
          .update({ 
            name, 
            description,
            updated_at: new Date().toISOString()
          })
          .eq('id', attributeId)
          .select()
          .single();

        if (attributeError) {
          console.error('Error updating attribute:', attributeError);
          return new Response(JSON.stringify({ error: attributeError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Replace attribute values if provided
        if (values.length > 0) {
          // First delete existing values
          const { error: deleteError } = await supabase
            .from('ae_attribute_values')
            .delete()
            .eq('attribute_id', attributeId);

          if (deleteError) {
            console.error('Error deleting attribute values:', deleteError);
            // Continue even if delete fails
          }

          // Then insert new values
          const attributeValues = values.map((value: string) => ({
            attribute_id: attributeId,
            value
          }));

          const { error: valuesError } = await supabase
            .from('ae_attribute_values')
            .insert(attributeValues);

          if (valuesError) {
            console.error('Error adding attribute values:', valuesError);
            // Continue even if values insertion fails
          }
        }

        // Fetch the complete attribute with its values
        const { data: completeAttribute, error: fetchError } = await supabase
          .from('ae_managed_attributes')
          .select(`
            *,
            ae_attribute_values(*)
          `)
          .eq('id', attributeId)
          .single();

        if (fetchError) {
          console.error('Error fetching complete attribute:', fetchError);
          return new Response(JSON.stringify({ attribute }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ attribute: completeAttribute }), {
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
      if (!attributeId) {
        return new Response(JSON.stringify({ error: 'Attribute ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        // Verify access
        await verifyProjectAccess(projectId);
        await verifyAttributeAccess(attributeId, projectId);

        // Delete attribute (values will be cascade deleted)
        const { error: deleteError } = await supabase
          .from('ae_managed_attributes')
          .delete()
          .eq('id', attributeId);

        if (deleteError) {
          console.error('Error deleting attribute:', deleteError);
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
