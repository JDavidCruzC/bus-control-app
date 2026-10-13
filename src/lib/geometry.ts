/** Convierte geometría de PostGIS (WKB/EWKB hex, WKT o GeoJSON) en coordenadas [lng, lat] de una LineString. */
export function parseLineString(geom: unknown): [number, number][] {
  if (!geom) return [];
  if (typeof geom === 'object' && Array.isArray((geom as any).coordinates)) {
    return (geom as any).coordinates as [number, number][];
  }
  if (typeof geom !== 'string') return [];
  const wkt = geom.match(/LINESTRING\s*\(([^)]+)\)/i);
  if (wkt) {
    return wkt[1].split(',').map((p) => {
      const [lng, lat] = p.trim().split(/\s+/).map(Number);
      return [lng, lat] as [number, number];
    });
  }
  if (!/^[0-9a-fA-F]+$/.test(geom)) return [];
  const bytes = new Uint8Array(geom.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(geom.substr(i * 2, 2), 16);
  const view = new DataView(bytes.buffer);
  const le = view.getUint8(0) === 1;
  let off = 1;
  const type = view.getUint32(off, le); off += 4;
  const hasZ = (type & 0x80000000) !== 0 || Math.floor((type & 0xffff) / 1000) === 1 || Math.floor((type & 0xffff) / 1000) === 3;
  const hasM = (type & 0x40000000) !== 0 || Math.floor((type & 0xffff) / 1000) === 2 || Math.floor((type & 0xffff) / 1000) === 3;
  if (type & 0x20000000) off += 4; // SRID
  if ((type & 0xff) % 1000 !== 2) return [];
  const n = view.getUint32(off, le); off += 4;
  const stride = 16 + (hasZ ? 8 : 0) + (hasM ? 8 : 0);
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    out.push([view.getFloat64(off, le), view.getFloat64(off + 8, le)]);
    off += stride;
  }
  return out;
}

/** Si la ruta es ida y vuelta por el mismo camino (palíndromo), devuelve solo la ida. */
export function splitIdaVuelta(coords: [number, number][]): { ida: [number, number][]; idaVuelta: boolean } {
  if (coords.length < 3 || coords.length % 2 === 0) return { ida: coords, idaVuelta: false };
  const same = (a: [number, number], b: [number, number]) => Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;
  for (let i = 0, j = coords.length - 1; i < j; i++, j--) {
    if (!same(coords[i], coords[j])) return { ida: coords, idaVuelta: false };
  }
  return { ida: coords.slice(0, (coords.length + 1) / 2), idaVuelta: true };
}

const ROUTE_PALETTE = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d', '#ea580c', '#4f46e5', '#be123c', '#0d9488'];
/** Color estable y distinto por línea (según su id). */
export function colorForRoute(id: string, index = 0): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ROUTE_PALETTE[(h + index) % ROUTE_PALETTE.length];
}
/** Color por posición: garantiza colores distintos entre líneas (hasta 12). */
export function routeColor(index: number): string {
  return ROUTE_PALETTE[index % ROUTE_PALETTE.length];
}
