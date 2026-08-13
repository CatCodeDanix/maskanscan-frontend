import {
	fetchMapDataAction,
	fetchViewportListingsAction,
} from "../app/actions/geospatial";
import {
	expandBBox,
	getZoomTier,
	isBBoxContained,
	snapBBox,
} from "../lib/geospatial";
import type { BBox } from "../types/geospatial";

async function runValidation() {
	console.log("=================================================");
	console.log("🧪 STARTING GEOSPATIAL PIPELINE VALIDATION SUITE");
	console.log("=================================================\n");

	let passed = 0;
	let failed = 0;

	function assert(name: string, condition: boolean, details?: string) {
		if (condition) {
			console.log(`✅ PASS: ${name}`);
			passed++;
		} else {
			console.error(`❌ FAIL: ${name} ${details ? `(${details})` : ""}`);
			failed++;
		}
	}

	// Warm up DB pool
	console.log("--- 0. Warming up DB connection pool ---");
	const warmStart = performance.now();
	await fetchMapDataAction({
		bbox: [51.35, 35.7, 51.4, 35.75],
		zoom: 12,
		filters: { dealType: "rent" },
	});
	console.log(
		`Connection warmed in ${(performance.now() - warmStart).toFixed(0)}ms\n`,
	);

	// ── 1. Unit Tests for Geometry & BBox Utilities ───────────────────────────
	console.log("--- 1. Geometry & BBox Math Tests ---");

	const tehranBbox: BBox = [51.15, 35.55, 51.62, 35.85];

	// Snap BBox
	const snapped = snapBBox([51.15234, 35.55123, 51.62888, 35.85999], 0.01);
	assert(
		"snapBBox rounds to 0.01 grid",
		snapped[0] === 51.15 &&
			snapped[1] === 35.55 &&
			snapped[2] === 51.63 &&
			snapped[3] === 35.86,
		`Got: ${JSON.stringify(snapped)}`,
	);

	// Expand BBox
	const expanded = expandBBox(tehranBbox, 0.25);
	assert(
		"expandBBox applies 25% padding margin",
		expanded[0] < tehranBbox[0] && expanded[2] > tehranBbox[2],
		`Original: ${JSON.stringify(tehranBbox)}, Expanded: ${JSON.stringify(expanded)}`,
	);

	// Containment Check
	const innerBbox: BBox = [51.2, 35.6, 51.5, 35.8];
	const outsideBbox: BBox = [51.0, 35.6, 51.5, 35.8];
	assert(
		"isBBoxContained returns true for inner box",
		isBBoxContained(innerBbox, tehranBbox),
	);
	assert(
		"isBBoxContained returns false for outside box",
		!isBBoxContained(outsideBbox, tehranBbox),
	);

	// Zoom Tier Split
	assert(
		"getZoomTier(10) returns 'clustered'",
		getZoomTier(10) === "clustered",
	);
	assert(
		"getZoomTier(13.9) returns 'clustered'",
		getZoomTier(13.9) === "clustered",
	);
	assert("getZoomTier(14) returns 'raw'", getZoomTier(14) === "raw");
	assert("getZoomTier(16) returns 'raw'", getZoomTier(16) === "raw");

	// ── 2. Live Server Action Test: Zoom < 14 (Clustered Tier) ───────────────
	console.log("\n--- 2. Live Server Action: Zoom < 14 Clustered Tier ---");
	const startClustered = performance.now();
	const clusteredRes = await fetchMapDataAction({
		bbox: tehranBbox,
		zoom: 11,
		filters: { dealType: "rent" },
	});
	const timeClustered = (performance.now() - startClustered).toFixed(2);

	assert(
		"fetchMapDataAction (zoom 11) returns success",
		clusteredRes.success === true,
	);
	assert(
		"fetchMapDataAction (zoom 11) tier is 'clustered'",
		clusteredRes.zoomTier === "clustered",
	);
	assert(
		"fetchMapDataAction (zoom 11) returns clusters and/or raw points",
		Array.isArray(clusteredRes.clusters) &&
			Array.isArray(clusteredRes.rawPoints),
		`Clusters: ${clusteredRes.clusters.length}, RawPoints: ${clusteredRes.rawPoints.length}`,
	);
	console.log(`⏱️ Clustered query execution time: ${timeClustered}ms`);

	if (clusteredRes.clusters.length > 0) {
		const sampleCluster = clusteredRes.clusters[0];
		assert(
			"Cluster item has valid structure (id, count, coords, dealType)",
			Boolean(
				sampleCluster.id &&
					sampleCluster.count > 1 &&
					sampleCluster.latitude &&
					sampleCluster.longitude &&
					sampleCluster.dealType,
			),
			`Sample: ${JSON.stringify(sampleCluster)}`,
		);
	}

	// ── 3. Live Server Action Test: Zoom >= 14 (Raw Points Tier) ─────────────
	console.log("\n--- 3. Live Server Action: Zoom >= 14 Raw Points Tier ---");
	const startRaw = performance.now();
	const rawRes = await fetchMapDataAction({
		bbox: [51.35, 35.7, 51.42, 35.76],
		zoom: 15,
		filters: { dealType: "rent" },
	});
	const timeRaw = (performance.now() - startRaw).toFixed(2);

	assert(
		"fetchMapDataAction (zoom 15) returns success",
		rawRes.success === true,
	);
	assert(
		"fetchMapDataAction (zoom 15) tier is 'raw'",
		rawRes.zoomTier === "raw",
	);
	assert(
		"fetchMapDataAction (zoom 15) clusters is empty array",
		rawRes.clusters.length === 0,
	);
	assert(
		"fetchMapDataAction (zoom 15) rawPoints is array",
		Array.isArray(rawRes.rawPoints),
	);
	assert(
		"fetchMapDataAction (zoom 15) returned padded bbox",
		rawRes.bbox[0] < 51.35 && rawRes.bbox[2] > 51.42,
		`BBox: ${JSON.stringify(rawRes.bbox)}`,
	);
	console.log(`⏱️ Raw tier query execution time: ${timeRaw}ms`);

	// ── 4. Live Server Action Test: Viewport Infinite Listings List ──────────
	console.log(
		"\n--- 4. Live Server Action: Viewport Infinite Listings List ---",
	);
	const startList = performance.now();
	const listRes = await fetchViewportListingsAction({
		bbox: tehranBbox,
		filters: { dealType: "rent" },
		page: 1,
		limit: 20,
	});
	const timeList = (performance.now() - startList).toFixed(2);

	assert(
		"fetchViewportListingsAction returns success",
		listRes.success === true,
	);
	assert(
		"fetchViewportListingsAction page size <= 20",
		listRes.items.length <= 20,
		`Count: ${listRes.items.length}`,
	);
	assert("fetchViewportListingsAction page is 1", listRes.page === 1);
	assert(
		"fetchViewportListingsAction total count >= 0",
		listRes.total >= 0,
		`Total: ${listRes.total}`,
	);
	console.log(`⏱️ Viewport list query execution time: ${timeList}ms`);

	if (listRes.items.length > 0) {
		const sampleListing = listRes.items[0];
		assert(
			"Listing item has valid rich structure (title, dealType, location)",
			Boolean(
				sampleListing.title && sampleListing.dealType && sampleListing.location,
			),
			`Sample: ${sampleListing.title} (${sampleListing.source})`,
		);
	}

	// ── 5. Live Server Action Test: Filter Integration (Buy + Exclude Agreed) ─
	console.log(
		"\n--- 5. Live Server Action: Filters (Buy & Exclude Agreed) ---",
	);
	const filterRes = await fetchMapDataAction({
		bbox: tehranBbox,
		zoom: 12,
		filters: { dealType: "buy", excludeAgreed: true },
	});
	assert(
		"fetchMapDataAction with Buy & ExcludeAgreed returns success",
		filterRes.success === true,
	);
	assert(
		"fetchMapDataAction filter returned dealType buy",
		filterRes.clusters.every((c) => c.dealType === "buy"),
	);

	console.log("\n=================================================");
	console.log(`🏁 VALIDATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
	console.log("=================================================");

	if (failed > 0) {
		process.exit(1);
	}
}

runValidation().catch((err) => {
	console.error("Validation error:", err);
	process.exit(1);
});
