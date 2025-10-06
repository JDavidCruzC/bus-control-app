import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Generate a secure random password
    const securePassword = crypto.randomUUID() + crypto.randomUUID();
    
    // Create admin user with proper authentication
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@sistema.com',
      password: securePassword,
      email_confirm: true,
      user_metadata: {
        user_type: 'trabajador'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to create auth user', details: authError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'No user created' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get empresa and role IDs
    const { data: empresa } = await supabaseAdmin
      .from('empresas')
      .select('id')
      .eq('nombre', 'Empresa Principal')
      .single()

    const { data: role } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('nombre', 'administrador')
      .single()

    if (!empresa || !role) {
      return new Response(
        JSON.stringify({ error: 'Empresa or role not found' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create user in usuarios table
    const { error: userError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: authData.user.id,
        email: 'admin@sistema.com',
        nombre: 'Administrador',
        apellido: 'Principal',
        empresa_id: empresa.id,
        rol_id: role.id,
        activo: true
      })

    if (userError) {
      console.error('Error creating usuario:', userError)
      return new Response(
        JSON.stringify({ error: 'Failed to create usuario', details: userError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuario administrador creado exitosamente. IMPORTANTE: Cambie la contraseña inmediatamente.',
        user_id: authData.user.id,
        email: 'admin@sistema.com',
        temporaryPassword: securePassword
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})