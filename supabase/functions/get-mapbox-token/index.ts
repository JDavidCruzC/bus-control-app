import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Try to get token from environment variables (Supabase Secrets)
    let token = Deno.env.get('MAPBOX_ACCESS_TOKEN')
    
    // If not in secrets, try to get from database configuraciones table
    if (!token) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      const { data, error } = await supabase
        .from('configuraciones')
        .select('valor')
        .eq('clave', 'mapbox_token')
        .maybeSingle()
      
      if (error) {
        console.error('Error fetching token from database:', error)
      }
      
      if (data?.valor) {
        token = data.valor
      }
    }
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Mapbox token no configurado. Por favor configúralo en Gestión de APIs.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ token }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in get-mapbox-token:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})