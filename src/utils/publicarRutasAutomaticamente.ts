import { supabase } from '@/integrations/supabase/client';

/**
 * Marca todas las rutas activas como públicas automáticamente
 * Para que aparezcan en la vista pública
 */
export async function publicarRutasAutomaticamente() {
  try {
    // Obtener todas las rutas activas
    const { data: rutasActivas, error: rutasError } = await supabase
      .from('rutas')
      .select('id')
      .eq('activo', true);

    if (rutasError) {
      console.error('Error obteniendo rutas:', rutasError);
      return;
    }

    if (!rutasActivas || rutasActivas.length === 0) {
      return;
    }

    // Para cada ruta activa, verificar si ya está en rutas_publicas
    for (const ruta of rutasActivas) {
      const { data: existente } = await supabase
        .from('rutas_publicas')
        .select('ruta_id')
        .eq('ruta_id', ruta.id)
        .single();

      if (!existente) {
        // Si no existe, crearla
        await supabase
          .from('rutas_publicas')
          .insert({
            ruta_id: ruta.id,
            visible_publico: true,
            fecha_publicacion: new Date().toISOString()
          });
      } else {
        // Si existe, asegurarse de que esté visible
        await supabase
          .from('rutas_publicas')
          .update({ visible_publico: true })
          .eq('ruta_id', ruta.id);
      }
    }

    console.log(`${rutasActivas.length} rutas publicadas automáticamente`);
  } catch (error) {
    console.error('Error publicando rutas:', error);
  }
}
