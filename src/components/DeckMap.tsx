"use client";

import type { PickingInfo } from "@deck.gl/core";
import type { Feature, LineString, MultiLineString, Point } from "geojson";
import { useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import TransitTooltip from "@/components/map/TransitTooltip";
import type { TransitProperties } from "@/data";
import { useTransitLayers } from "@/lib/overlay-layers";
import DeckGLOverlay from "./DeckGLOverlay";

const DeckMap = () => {
	const layers = useTransitLayers();

	const getTooltip = useMemo(
		() =>
			(
				info: PickingInfo<
					Feature<Point | LineString | MultiLineString, TransitProperties>
				>,
			) => {
				if (!info.object) return null;
				const html = renderToStaticMarkup(
					<TransitTooltip properties={info.object.properties} />,
				);
				return {
					html,
					className: "deck-tooltip-reset", // CSS class defined in globals.css
				};
			},
		[],
	);

	return <DeckGLOverlay layers={layers} getTooltip={getTooltip} />;
};

export default DeckMap;
