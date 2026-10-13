import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TEMP_PASSWORD = '123456'
const SUPERADMIN_ID = 'e17f1058-703d-407c-aaa0-a15a01cfbcda'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email ?? '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      return json({ error: 'Correo inválido' }, 400)
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Buscar usuario en auth por email (paginado)
    let found: any = null
    for (let page = 1; page <= 20 && !found; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
      if (error) throw error
      found = data.users.find((u) => (u.email ?? '').toLowerCase() === email)
      if (data.users.length < 200) break
    }

    if (!found) return json({ error: 'No existe una cuenta registrada con ese correo' }, 404)
    if (found.id === SUPERADMIN_ID) {
      return json({ error: 'Esta cuenta no puede restablecerse desde aquí' }, 403)
    }

    const { error: updError } = await admin.auth.admin.updateUserById(found.id, {
      password: TEMP_PASSWORD,
      email_confirm: true,
      user_metadata: { ...(found.user_metadata ?? {}), must_change_password: true },
    })
    if (updError) throw updError

    return json({ success: true })
  } catch (e) {
    console.error('reset-password-temp error', e)
    return json({ error: 'No se pudo restablecer la contraseña' }, 500)
  }
})
