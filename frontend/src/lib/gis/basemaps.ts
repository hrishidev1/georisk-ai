export interface BasemapOption {
  id: string;
  name: string;
  description: string;
  styleUrl: string;
  thumbnail: string;
  attribution: string;
}

export const BASEMAP_OPTIONS: BasemapOption[] = [
  {
    id: "positron",
    name: "Carto Positron",
    description: "Clean light vector basemap optimized for geospatial analytics",
    styleUrl: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    thumbnail: "bg-[#f2f3f4]",
    attribution: "© CARTO, © OpenStreetMap contributors",
  },
  {
    id: "dark-matter",
    name: "Dark Matter",
    description: "Sleek dark basemap ideal for high-contrast terrain derivatives",
    styleUrl: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    thumbnail: "bg-[#1f2429]",
    attribution: "© CARTO, © OpenStreetMap contributors",
  },
  {
    id: "voyager",
    name: "Carto Voyager",
    description: "Detailed colored basemap with labels and terrain cues",
    styleUrl: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
    thumbnail: "bg-[#e8ecef]",
    attribution: "© CARTO, © OpenStreetMap contributors",
  },
];

export const DEFAULT_BASEMAP = BASEMAP_OPTIONS[0];
