import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const PLACA_RE = /^[A-Z0-9-]{3,12}$/

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Validar quién llama
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
    if (!token) return json({ error: 'No autorizado' }, 401)
    const { data: authUser, error: authErr } = await admin.auth.getUser(token)
    if (authErr || !authUser.user) return json({ error: 'Sesión inválida' }, 401)

    const { data: caller } = await admin
      .from('usuarios').select('id, empresa_id, rol:roles(nombre)').eq('id', authUser.user.id).maybeSingle()
    const rol = (caller as any)?.rol?.nombre
    if (!caller || !['gerente', 'administrador', 'super_admin'].includes(rol)) {
      return json({ error: 'No tienes permiso para gestionar conductores' }, 403)
    }
    const empresaId = caller.empresa_id
    if (!empresaId && rol !== 'super_admin') return json({ error: 'Tu usuario no tiene empresa' }, 403)

    const body = await req.json().catch(() => ({}))
    const action = String(body?.action ?? '')
    const password = String(body?.password ?? '')
    if (password.length < 6 || password.length > 72) {
      return json({ error: 'La contraseña debe tener entre 6 y 72 caracteres' }, 400)
    }

    if (action === 'crear') {
      const placa = String(body?.placa ?? '').trim().toUpperCase()
      const nombre = String(body?.nombre ?? '').trim().slice(0, 100)
      const apellido = String(body?.apellido ?? '').trim().slice(0, 100)
      const telefono = String(body?.telefono ?? '').trim().slice(0, 20)
      const rutaId = body?.ruta_id ? String(body.ruta_id) : null
      const tipo = body?.tipo === 'cobrador' ? 'cobrador' : 'conductor'
      if (!PLACA_RE.test(placa)) return json({ error: 'Placa inválida (solo letras, números y guiones)' }, 400)
      if (!nombre) return json({ error: 'El nombre es obligatorio' }, 400)

      const { data: dup } = await admin.from('conductores').select('id').eq('licencia_numero', placa).maybeSingle()
      if (dup) return json({ error: 'Ya existe un conductor con esa placa' }, 409)

      if (rutaId) {
        const { data: ruta } = await admin.from('rutas').select('empresa_id').eq('id', rutaId).maybeSingle()
        if (!ruta || ruta.empresa_id !== empresaId) return json({ error: 'La línea no pertenece a tu empresa' }, 400)
      }

      const { data: rolRow } = await admin.from('roles').select('id').eq('nombre', tipo).maybeSingle()
      const email = `${placa.toLowerCase()}.${crypto.randomUUID().slice(0, 6)}@conductor.local`
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { nombre, apellido },
      })
      if (cErr || !created.user) return json({ error: cErr?.message ?? 'No se pudo crear la cuenta' }, 400)
      const uid = created.user.id

      const { error: uErr } = await admin.from('usuarios').insert({
        id: uid, nombre, apellido, email, telefono: telefono || null, rol_id: rolRow?.id ?? null,
        empresa_id: empresaId, activo: true, linea_id: rutaId,
      })
      if (uErr) { await admin.auth.admin.deleteUser(uid); return json({ error: uErr.message }, 400) }

      const { error: kErr } = await admin.from('conductores').insert({
        usuario_id: uid, placa, licencia_numero: placa, ruta_id: rutaId, activo: true,
      })
      if (kErr) {
        await admin.from('usuarios').delete().eq('id', uid)
        await admin.auth.admin.deleteUser(uid)
        return json({ error: kErr.message }, 400)
      }
      return json({ success: true })
    }

    if (action === 'cambiar_password') {
      const conductorId = String(body?.conductor_id ?? '')
      const { data: cond } = await admin
        .from('conductores').select('usuario_id, usuario:usuarios(empresa_id)').eq('id', conductorId).maybeSingle()
      if (!cond) return json({ error: 'Conductor no encontrado' }, 404)
      if (rol !== 'super_admin' && (cond as any).usuario?.empresa_id !== empresaId) {
        return json({ error: 'Este conductor no pertenece a tu empresa' }, 403)
      }
      const { error } = await admin.auth.admin.updateUserById(cond.usuario_id!, { password })
      if (error) return json({ error: error.message }, 400)
      return json({ success: true })
    }

    return json({ error: 'Acción no válida' }, 400)
  } catch (e) {
    console.error('gestionar-conductor error', e)
    return json({ error: 'Error interno' }, 500)
  }
})
