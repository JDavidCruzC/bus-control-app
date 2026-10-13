CREATE OR REPLACE FUNCTION public.auto_publicar_ruta()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.empresa_id IS NOT NULL THEN
    INSERT INTO rutas_publicas (ruta_id, visible_publico, fecha_publicacion)
    VALUES (NEW.id, COALESCE(NEW.activo, true), now())
    ON CONFLICT (ruta_id) DO UPDATE SET visible_publico = COALESCE(NEW.activo, true);
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.auto_publicar_ruta() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_auto_publicar_ruta
AFTER INSERT OR UPDATE OF activo, empresa_id ON public.rutas
FOR EACH ROW EXECUTE FUNCTION public.auto_publicar_ruta();

INSERT INTO public.rutas_publicas (ruta_id, visible_publico, fecha_publicacion)
SELECT id, true, now() FROM public.rutas WHERE activo AND empresa_id IS NOT NULL
ON CONFLICT (ruta_id) DO UPDATE SET visible_publico = true;