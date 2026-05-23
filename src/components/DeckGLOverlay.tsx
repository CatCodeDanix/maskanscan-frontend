import { DeckProps } from "@deck.gl/core";
import { useControl } from "react-map-gl/maplibre";
import { MapboxOverlay } from "@deck.gl/mapbox";

function DeckGLOverlay(props: DeckProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export default DeckGLOverlay;
