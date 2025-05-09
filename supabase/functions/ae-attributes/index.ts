
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
      // Get managed attributes for project with their values
      const { data: attributes, error } = await supabase
        .from('ae_managed_attributes')
        .select(`
          id,
          name,
          description,
          created_at,
          updated_at,
          ae_attribute_values (
            id,
            value
          )
        `)
        .eq('project_id', projectId)
        .order('name');

      if (error) {
        console.error('Error fetching attributes:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ attributes }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } 
    else if (req.method === 'POST') {
      // Create a new attribute
      const { name, description, predefinedValues = [] } = await req.json();
      
      if (!name) {
        return new Response(JSON.stringify({ error: 'Attribute name is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Start a transaction
      const { data: attribute, error: attrError } = await supabase
        .from('ae_managed_attributes')
        .insert([{ 
          name, 
          description, 
          project_id: projectId 
        }])
        .select()
        .single();

      if (attrError) {
        console.error('Error creating attribute:', attrError);
        return new Response(JSON.stringify({ error: attrError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Add predefined values if provided
      if (predefinedValues.length > 0) {
        const valuesToInsert = predefinedValues.map(value => ({
          attribute_id: attribute.id,
          value
        }));
        
        const { error: valuesError } = await supabase
          .from('ae_attribute_values')
          .insert(valuesToInsert);

        if (valuesError) {
          console.error('Error adding predefined values:', valuesError);
          return new Response(JSON.stringify({ error: valuesError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Get complete attribute with values
      const { data: completeAttribute, error: fetchError } = await supabase
        .from('ae_managed_attributes')
        .select(`
          id,
          name,
          description,
          created_at,
          updated_at,
          ae_attribute_values (
            id,
            value
          )
        `)
        .eq('id', attribute.id)
        .single();

      if (fetchError) {
        console.error('Error fetching complete attribute:', fetchError);
        return new Response(JSON.stringify({ error: fetchError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ attribute: completeAttribute }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (req.method === 'DELETE') {
      // Delete an attribute
      const attributeId = url.searchParams.get('attributeId');
      
      if (!attributeId) {
        return new Response(JSON.stringify({ error: 'Attribute ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify attribute belongs to the specified project
      const { data: attrData, error: attrError } = await supabase
        .from('ae_managed_attributes')
        .select('id')
        .eq('id', attributeId)
        .eq('project_id', projectId)
        .single();
        
      if (attrError || !attrData) {
        return new Response(JSON.stringify({ error: 'Attribute not found or access denied' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Delete attribute (values will be cascade deleted due to foreign key)
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
