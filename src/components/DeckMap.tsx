"use client";

import { useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import DeckGLOverlay from "./DeckGLOverlay";
import { useTransitLayers } from "@/lib/overlay-layers";
import TransitTooltip from "@/components/map/TransitTooltip";
import type { PickingInfo } from "@deck.gl/core";
import type { Feature, Point, LineString, MultiLineString } from "geojson";
import type { TransitProperties } from "@/data";

const DeckMap = () => {
  const layers = useTransitLayers();

  const getTooltip = useMemo(
    () =>
      (
        info: PickingInfo<
          Feature<Point | LineString | MultiLineString, TransitProperties>
        >
      ) => {
        if (!info.object) return null;
        const html = renderToStaticMarkup(
          <TransitTooltip properties={info.object.properties} />
        );
        return {
          html,
          className: "deck-tooltip-reset", // CSS class defined in globals.css
        };
      },
    []
  );

  return <DeckGLOverlay layers={layers} getTooltip={getTooltip} />;
};

export default DeckMap;
