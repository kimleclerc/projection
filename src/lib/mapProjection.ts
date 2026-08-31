export type Point = [number, number];

export interface ProjectionSpec {
  center: [number, number];
  width: number;
  height: number;
  padding?: number;
}

export interface GeoFeatureLike {
  properties?: Record<string, unknown>;
  geometry?: { type?: string; coordinates?: unknown };
}

export interface ProjectedShape {
  feature: GeoFeatureLike;
  path: string;
  bounds: [number, number, number, number];
  inset?: string;
}

export function lambertProject(lon: number, lat: number, center: [number, number]): Point {
  const [lat0, lon0] = center;
  const lat1 = Math.max(-75, Math.min(75, lat0 - 10));
  const lat2 = Math.max(-75, Math.min(75, lat0 + 10));
  const toRad = Math.PI / 180;
  const phi = lat * toRad;
  const lambda = lon * toRad;
  const phi0 = lat0 * toRad;
  const lambda0 = lon0 * toRad;
  const p1 = lat1 * toRad;
  const p2 = lat2 * toRad;
  const n = Math.log(Math.cos(p1) / Math.cos(p2)) /
    Math.log(Math.tan(Math.PI / 4 + p2 / 2) / Math.tan(Math.PI / 4 + p1 / 2));
  const safeN = Number.isFinite(n) && Math.abs(n) > 1e-6 ? n : Math.sin(phi0 || .5);
  const f = Math.cos(p1) * Math.pow(Math.tan(Math.PI / 4 + p1 / 2), safeN) / safeN;
  const rho = f / Math.pow(Math.tan(Math.PI / 4 + phi / 2), safeN);
  const rho0 = f / Math.pow(Math.tan(Math.PI / 4 + phi0 / 2), safeN);
  const theta = safeN * (lambda - lambda0);
  return [rho * Math.sin(theta), rho0 - rho * Math.cos(theta)];
}

function walkPositions(value: unknown, visit: (lon: number, lat: number) => void): void {
  if (!Array.isArray(value) || value.length === 0) return;
  if (typeof value[0] === 'number' && typeof value[1] === 'number') {
    visit(Number(value[0]), Number(value[1]));
    return;
  }
  for (const child of value) walkPositions(child, visit);
}

function featureCentroid(feature: GeoFeatureLike): Point {
  let sx = 0;
  let sy = 0;
  let n = 0;
  walkPositions(feature.geometry?.coordinates, (lon, lat) => {
    sx += lon;
    sy += lat;
    n += 1;
  });
  return n ? [sx / n, sy / n] : [0, 0];
}

function featureId(feature: GeoFeatureLike, idProp: string): string {
  return String(feature.properties?.[idProp] ?? feature.properties?.riding_id ?? '');
}

function insetKey(feature: GeoFeatureLike, geoUrl: string, idProp: string): string {
  const id = featureId(feature, idProp).padStart(5, '0');
  if (geoUrl.includes('/us-house/')) {
    if (id.startsWith('02')) return 'Alaska';
    if (id.startsWith('15')) return 'Hawaii';
  }
  if (geoUrl.includes('/france-legislative/')) {
    const [lon, lat] = featureCentroid(feature);
    if (lon < -10 || lon > 15 || lat < 40 || lat > 53) {
      return String(feature.properties?.dept ?? id.slice(0, 3) ?? 'Outre-mer');
    }
  }
  return 'main';
}

function normalizeLongitude(lon: number, lon0: number): number {
  let out = lon;
  while (out - lon0 > 180) out -= 360;
  while (lon0 - out > 180) out += 360;
  return out;
}

function projectCoordinates(value: unknown, center: [number, number]): unknown {
  if (!Array.isArray(value) || value.length === 0) return value;
  if (typeof value[0] === 'number' && typeof value[1] === 'number') {
    return lambertProject(normalizeLongitude(Number(value[0]), center[1]), Number(value[1]), center);
  }
  return value.map((child) => projectCoordinates(child, center));
}

function boundsOf(value: unknown): [number, number, number, number] {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  walkPositions(value, (x, y) => {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  });
  return Number.isFinite(x0) ? [x0, y0, x1, y1] : [0, 0, 1, 1];
}

function mergeBounds(items: Array<[number, number, number, number]>): [number, number, number, number] {
  return items.reduce(
    (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])],
    [Infinity, Infinity, -Infinity, -Infinity],
  );
}

function fitPoint(
  point: Point,
  source: [number, number, number, number],
  box: [number, number, number, number],
): Point {
  const sw = Math.max(1e-9, source[2] - source[0]);
  const sh = Math.max(1e-9, source[3] - source[1]);
  const bw = box[2] - box[0];
  const bh = box[3] - box[1];
  const scale = Math.min(bw / sw, bh / sh);
  const ox = box[0] + (bw - sw * scale) / 2;
  const oy = box[1] + (bh - sh * scale) / 2;
  return [ox + (point[0] - source[0]) * scale, oy + (point[1] - source[1]) * scale];
}

function mapCoordinates(value: unknown, fn: (point: Point) => Point): unknown {
  if (!Array.isArray(value) || value.length === 0) return value;
  if (typeof value[0] === 'number' && typeof value[1] === 'number') {
    return fn([Number(value[0]), Number(value[1])]);
  }
  return value.map((child) => mapCoordinates(child, fn));
}

function ringPath(ring: unknown): string {
  if (!Array.isArray(ring) || ring.length === 0) return '';
  return ring.map((point, index) => {
    const p = point as Point;
    return `${index ? 'L' : 'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`;
  }).join('') + 'Z';
}

function geometryPath(type: string | undefined, coordinates: unknown): string {
  if (type === 'Polygon' && Array.isArray(coordinates)) {
    return coordinates.map(ringPath).join('');
  }
  if (type === 'MultiPolygon' && Array.isArray(coordinates)) {
    return coordinates.flatMap((polygon) => Array.isArray(polygon) ? polygon.map(ringPath) : []).join('');
  }
  return '';
}

/**
 * Project GeoJSON locally, with no slippy-map or Web Mercator dependency.
 * Alaska, Hawaii and French overseas territories are fitted into explicit
 * inset boxes so discontinuous geography never crushes the main map.
 */
export function projectFeatures(
  features: GeoFeatureLike[],
  geoUrl: string,
  idProp: string,
  spec: ProjectionSpec,
): ProjectedShape[] {
  const padding = spec.padding ?? 18;
  const grouped = new Map<string, Array<{ feature: GeoFeatureLike; coords: unknown; bounds: [number, number, number, number] }>>();
  for (const feature of features) {
    const key = insetKey(feature, geoUrl, idProp);
    const c = featureCentroid(feature);
    const center: [number, number] = key === 'main' ? spec.center : [c[1], c[0]];
    const coords = projectCoordinates(feature.geometry?.coordinates, center);
    const row = { feature, coords, bounds: boundsOf(coords) };
    grouped.set(key, [...(grouped.get(key) ?? []), row]);
  }

  const insetKeys = [...grouped.keys()].filter((key) => key !== 'main').sort();
  const mainBottom = insetKeys.length ? spec.height * .79 : spec.height - padding;
  const boxes = new Map<string, [number, number, number, number]>();
  boxes.set('main', [padding, padding, spec.width - padding, mainBottom]);
  if (insetKeys.length) {
    const gap = 8;
    const available = spec.width - padding * 2 - gap * (insetKeys.length - 1);
    const w = available / insetKeys.length;
    insetKeys.forEach((key, index) => {
      const x = padding + index * (w + gap);
      boxes.set(key, [x, mainBottom + 12, x + w, spec.height - padding]);
    });
  }

  const out: ProjectedShape[] = [];
  for (const [key, rows] of grouped) {
    const source = mergeBounds(rows.map((row) => row.bounds));
    const box = boxes.get(key) ?? boxes.get('main')!;
    for (const row of rows) {
      const fitted = mapCoordinates(row.coords, (point) => fitPoint(point, source, box));
      out.push({
        feature: row.feature,
        path: geometryPath(row.feature.geometry?.type, fitted),
        bounds: boundsOf(fitted),
        inset: key === 'main' ? undefined : key,
      });
    }
  }
  return out;
}
