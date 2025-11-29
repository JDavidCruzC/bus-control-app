-- Actualizar el token de Mapbox directamente
UPDATE configuraciones 
SET valor = 'pk.eyJ1IjoiamRhdmlkLWNjIiwiYSI6ImNtaWtvM2w5OTFlOWozZ3B2aTR3azUzM3AifQ.pP_9FNAQhdHhI44DqnEYPw',
    updated_at = now()
WHERE clave = 'mapbox_token' AND empresa_id IS NULL;