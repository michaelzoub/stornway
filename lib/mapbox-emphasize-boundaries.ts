import type mapboxgl from "mapbox-gl";

const SERVICE_SOURCE = "service-area";
const SERVICE_LINE = "service-area-line";
const PRIORITY_SOURCE = "priority-zone";
const PRIORITY_FILL = "priority-zone-fill";
const PRIORITY_LINE = "priority-zone-line";

export async function setupMapDemarcation(map: mapboxgl.Map): Promise<void> {
  if (!map.isStyleLoaded()) return;

  try {
    const [serviceRes, priorityRes] = await Promise.all([
      fetch("/geo/montreal-isle.geojson"),
      fetch("/geo/priority-zone.geojson"),
    ]);

    if (serviceRes.ok && !map.getSource(SERVICE_SOURCE)) {
      const serviceArea = await serviceRes.json();
      map.addSource(SERVICE_SOURCE, { type: "geojson", data: serviceArea });
      map.addLayer({
        id: SERVICE_LINE,
        type: "line",
        source: SERVICE_SOURCE,
        paint: {
          "line-color": "#0f1b08",
          "line-width": 2.5,
          "line-dasharray": [2, 2],
        },
      });
    }

    if (priorityRes.ok && !map.getSource(PRIORITY_SOURCE)) {
      const priorityZone = await priorityRes.json();
      map.addSource(PRIORITY_SOURCE, { type: "geojson", data: priorityZone });
      map.addLayer({
        id: PRIORITY_FILL,
        type: "fill",
        source: PRIORITY_SOURCE,
        paint: {
          "fill-color": "#38bdf8",
          "fill-opacity": 0.18,
        },
      });
      map.addLayer({
        id: PRIORITY_LINE,
        type: "line",
        source: PRIORITY_SOURCE,
        paint: {
          "line-color": "#0ea5e9",
          "line-width": 1.5,
          "line-dasharray": [2, 2],
        },
      });
    }
  } catch (error) {
    console.error("[setupMapDemarcation]", error);
  }
}
