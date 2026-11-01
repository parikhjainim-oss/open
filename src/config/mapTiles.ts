// Central map-provider configuration.
//
// To change tile providers later, edit TILE_URL (and TILE_ATTRIBUTION if the
// provider requires different credit). Any Leaflet-compatible XYZ tile URL
// works, e.g.:
//   OpenStreetMap : https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
//   CARTO light   : https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const TILE_MAX_ZOOM = 19;

export interface MapTileConfig { url: string; attribution: string; maxZoom: number; }
export const mapTileConfig: MapTileConfig = { url: TILE_URL, attribution: TILE_ATTRIBUTION, maxZoom: TILE_MAX_ZOOM };
