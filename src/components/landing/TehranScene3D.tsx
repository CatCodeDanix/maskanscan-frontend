"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface TehranScene3DProps {
	scrollProgress?: number; // 0 to 1
}

export interface NeighborhoodPin {
	name: string;
	persianName: string;
	district: number;
	position: [number, number, number];
	avgRent: string;
	avgDeposit: string;
	listingsCount: number;
	source: "divar" | "sheypoor" | "kilid" | "mrestate";
}

export const TEHRAN_NEIGHBORHOODS: NeighborhoodPin[] = [
	{
		name: "saadat-abad",
		persianName: "سعادت‌آباد",
		district: 2,
		position: [-4.2, 1.8, -2.5],
		avgRent: "۳۵ میلیون",
		avgDeposit: "۱.۲ میلیارد",
		listingsCount: 420,
		source: "divar",
	},
	{
		name: "shahrak-gharb",
		persianName: "شهرک غرب",
		district: 2,
		position: [-3.8, 1.5, -1.2],
		avgRent: "۴۰ میلیون",
		avgDeposit: "۱.۵ میلیارد",
		listingsCount: 310,
		source: "sheypoor",
	},
	{
		name: "tajrish",
		persianName: "تجریش / الهیه",
		district: 1,
		position: [0.5, 2.8, -4.5],
		avgRent: "۶۵ میلیون",
		avgDeposit: "۲.۸ میلیارد",
		listingsCount: 280,
		source: "kilid",
	},
	{
		name: "vanak",
		persianName: "میدان ونک",
		district: 3,
		position: [-0.8, 1.4, -1.0],
		avgRent: "۲۸ میلیون",
		avgDeposit: "۹۵۰ میلیون",
		listingsCount: 540,
		source: "divar",
	},
	{
		name: "yousef-abad",
		persianName: "یوسف‌آباد",
		district: 6,
		position: [-0.5, 1.0, 0.8],
		avgRent: "۲۲ میلیون",
		avgDeposit: "۸۰۰ میلیون",
		listingsCount: 390,
		source: "mrestate",
	},
	{
		name: "punak",
		persianName: "پونک",
		district: 5,
		position: [-5.5, 1.2, -0.5],
		avgRent: "۱۸ میلیون",
		avgDeposit: "۶۵۰ میلیون",
		listingsCount: 460,
		source: "sheypoor",
	},
	{
		name: "tehranpars",
		persianName: "تهرانپارس",
		district: 4,
		position: [5.2, 0.9, 0.2],
		avgRent: "۱۶ میلیون",
		avgDeposit: "۶۰۰ میلیون",
		listingsCount: 620,
		source: "divar",
	},
	{
		name: "pasdaran",
		persianName: "پاسداران",
		district: 3,
		position: [2.8, 2.0, -2.8],
		avgRent: "۳۸ میلیون",
		avgDeposit: "۱.۴ میلیارد",
		listingsCount: 340,
		source: "kilid",
	},
	{
		name: "sattarkhan",
		persianName: "ستارخان",
		district: 2,
		position: [-3.2, 0.8, 1.5],
		avgRent: "۱۵ میلیون",
		avgDeposit: "۵۵۰ میلیون",
		listingsCount: 480,
		source: "mrestate",
	},
];

export function TehranScene3D({ scrollProgress = 0 }: TehranScene3DProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const sceneRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;
		pins: THREE.Group[];
		particles: THREE.Points;
		highwayLines: THREE.LineSegments[];
		buildingMesh: THREE.InstancedMesh;
		currentScroll: number;
		targetCameraPos: THREE.Vector3;
		targetCameraLookAt: THREE.Vector3;
		currentCameraPos: THREE.Vector3;
		currentCameraLookAt: THREE.Vector3;
		mousePos: { x: number; y: number; targetX: number; targetY: number };
		raycaster: THREE.Raycaster;
		pointer: THREE.Vector2;
		hoveredPin: NeighborhoodPin | null;
	} | null>(null);

	const [hoveredPinData, setHoveredPinData] = React.useState<{
		pin: NeighborhoodPin;
		screenX: number;
		screenY: number;
	} | null>(null);

	useEffect(() => {
		if (sceneRef.current) {
			sceneRef.current.currentScroll = scrollProgress;
		}
	}, [scrollProgress]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// 1. Scene setup
		const scene = new THREE.Scene();
		const isDark = document.documentElement.classList.contains("dark");

		// Atmosphere fog
		const fogColor = isDark ? 0x090b10 : 0xf4f6fa;
		scene.fog = new THREE.FogExp2(fogColor, 0.045);

		// 2. Camera setup
		const aspect = container.clientWidth / container.clientHeight;
		const fov = aspect > 2.0 ? 38 : aspect < 1.0 ? 55 : 44;
		const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
		camera.position.set(0, 11, 14);

		// 3. Renderer setup
		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			powerPreference: "high-performance",
			alpha: true,
		});
		renderer.setSize(container.clientWidth, container.clientHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(fogColor, 1);
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.1;
		container.appendChild(renderer.domElement);

		// 4. Lighting
		const ambientLight = new THREE.AmbientLight(
			isDark ? 0x223344 : 0xe0e7ff,
			isDark ? 1.4 : 2.2,
		);
		scene.add(ambientLight);

		const dirLight = new THREE.DirectionalLight(0xffb74d, isDark ? 2.2 : 3.0); // Saffron Warm Gold
		dirLight.position.set(12, 18, 8);
		scene.add(dirLight);

		const secondaryLight = new THREE.DirectionalLight(
			0x00bcd4,
			isDark ? 1.6 : 1.2,
		); // Cyan secondary
		secondaryLight.position.set(-10, 12, -8);
		scene.add(secondaryLight);

		// 5. Alborz Mountains Backdrop (Northern Wireframe Ridge)
		const mountainGeo = new THREE.PlaneGeometry(80, 18, 48, 16);
		const mountainPos = mountainGeo.attributes.position;
		for (let i = 0; i < mountainPos.count; i++) {
			const x = mountainPos.getX(i);
			const y = mountainPos.getY(i);
			// Elevate top vertices to form mountain jagged peaks
			if (y > -2) {
				const heightNoise =
					Math.sin(x * 0.3) * 2.8 +
					Math.sin(x * 0.7 + 1.2) * 1.8 +
					Math.cos(x * 1.2) * 1.0;
				mountainPos.setZ(i, Math.max(0, heightNoise * (y + 2) * 0.45));
			}
		}
		mountainGeo.computeVertexNormals();
		const mountainMat = new THREE.MeshStandardMaterial({
			color: isDark ? 0x1a2436 : 0xccd6e6,
			wireframe: true,
			roughness: 0.8,
			transparent: true,
			opacity: isDark ? 0.35 : 0.45,
		});
		const mountainMesh = new THREE.Mesh(mountainGeo, mountainMat);
		mountainMesh.rotation.x = -Math.PI / 2 + 0.3;
		mountainMesh.position.set(0, 2.2, -18);
		scene.add(mountainMesh);

		// 6. Procedural Tehran District Building Blocks (InstancedMesh for max 60fps performance)
		const buildingGeo = new THREE.BoxGeometry(0.42, 1, 0.42);
		// Chamfer / shift origin to bottom
		buildingGeo.translate(0, 0.5, 0);

		const buildingMat = new THREE.MeshStandardMaterial({
			color: isDark ? 0x161d2a : 0xd8e0ec,
			roughness: 0.4,
			metalness: 0.2,
		});

		const gridSize = 56;
		const totalBuildings = gridSize * gridSize;
		const buildingMesh = new THREE.InstancedMesh(
			buildingGeo,
			buildingMat,
			totalBuildings,
		);
		const dummy = new THREE.Object3D();
		const _matrix = new THREE.Matrix4();
		const color = new THREE.Color();

		let idx = 0;
		for (let x = 0; x < gridSize; x++) {
			for (let z = 0; z < gridSize; z++) {
				const worldX = (x - gridSize / 2) * 0.72;
				const worldZ = (z - gridSize / 2) * 0.68;

				// Tehran elevation slope: higher in north (negative Z), lower in south (positive Z)
				const slopeElevation = Math.max(0, (-worldZ + 12) * 0.1);

				// City center density peak
				const distFromCenter = Math.sqrt(worldX * worldX + worldZ * worldZ);
				const density = Math.max(0.1, 1 - distFromCenter / 18);

				// Organic Perlin-like building heights
				const noiseHeight =
					Math.sin(worldX * 0.6) * Math.cos(worldZ * 0.6) * 0.9 +
					Math.sin(worldX * 1.3 + 0.5) * 0.4;
				const height = Math.max(
					0.12,
					(density * 1.8 + noiseHeight + slopeElevation) *
						(0.4 + Math.random() * 0.8),
				);

				dummy.position.set(
					worldX + (Math.random() - 0.5) * 0.1,
					0,
					worldZ + (Math.random() - 0.5) * 0.1,
				);
				dummy.scale.set(
					0.85 + Math.random() * 0.3,
					height,
					0.85 + Math.random() * 0.3,
				);
				dummy.updateMatrix();

				buildingMesh.setMatrixAt(idx, dummy.matrix);

				// Highlight tall towers with subtle saffron / cyan glow
				if (height > 1.8) {
					color.setHex(isDark ? 0xe58a13 : 0xd97706); // Saffron Gold Tower
				} else if (height > 1.3 && Math.random() > 0.6) {
					color.setHex(isDark ? 0x00bcd4 : 0x0284c7); // Cyan Transit Node
				} else {
					color.setHex(isDark ? 0x141b26 : 0xdce3ee);
				}
				buildingMesh.setColorAt(idx, color);
				idx++;
			}
		}
		buildingMesh.instanceMatrix.needsUpdate = true;
		if (buildingMesh.instanceColor)
			buildingMesh.instanceColor.needsUpdate = true;
		scene.add(buildingMesh);

		// 7. Ground Grid Plate & District Boundary Contours
		const gridHelper = new THREE.GridHelper(
			64,
			64,
			isDark ? 0xe58a13 : 0xf59e0b,
			isDark ? 0x1f293d : 0xcfd8e3,
		);
		gridHelper.position.y = -0.01;
		scene.add(gridHelper);

		// 8. Arterial Highway Network (Glowing lines for Hemmat, Chamran, Modarres, Resalat)
		const highways = [
			// Hemmat / Hakim Expressways (East-West)
			[
				[-18, 0.08, -1.8],
				[-9, 0.08, -1.7],
				[0, 0.08, -1.9],
				[9, 0.08, -1.6],
				[18, 0.08, -1.8],
			],
			// Chamran Expressway (North-South West)
			[
				[-5.5, 0.08, -8.0],
				[-4.5, 0.08, -3.5],
				[-4.0, 0.08, 0],
				[-3.5, 0.08, 5.0],
				[-3.0, 0.08, 10.0],
			],
			// Modarres Expressway (North-South Center)
			[
				[1.2, 0.08, -8.0],
				[0.8, 0.08, -3.0],
				[0.4, 0.08, 1.0],
				[0.0, 0.08, 6.0],
			],
			// Niayesh / Sadr Expressway (North East-West)
			[
				[-16, 0.08, -4.2],
				[-6, 0.08, -3.8],
				[4, 0.08, -4.0],
				[16, 0.08, -3.7],
			],
		];

		const highwayLines: THREE.LineSegments[] = [];
		highways.forEach((coords, hIdx) => {
			const _points: THREE.Vector3[] = [];
			const curve = new THREE.CatmullRomCurve3(
				coords.map((c) => new THREE.Vector3(c[0], c[1], c[2])),
			);
			const curvePoints = curve.getPoints(50);
			const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
			const lineMat = new THREE.LineBasicMaterial({
				color: hIdx % 2 === 0 ? 0xe58a13 : 0x00e5ff,
				linewidth: 2,
				transparent: true,
				opacity: isDark ? 0.85 : 0.65,
			});
			const line = new THREE.Line(lineGeo, lineMat);
			scene.add(line);
		});

		// 9. Floating Holographic Neighborhood Pins
		const pins: THREE.Group[] = [];
		const pinGeo = new THREE.ConeGeometry(0.18, 0.45, 6);
		pinGeo.rotateX(Math.PI); // Point down towards city block
		pinGeo.translate(0, 0.25, 0);

		const ringGeo = new THREE.RingGeometry(0.16, 0.28, 24);
		ringGeo.rotateX(-Math.PI / 2);

		TEHRAN_NEIGHBORHOODS.forEach((pinData) => {
			const pinGroup = new THREE.Group();
			pinGroup.position.set(...pinData.position);
			pinGroup.userData = { pinData };

			// Cone Marker
			const pinMat = new THREE.MeshStandardMaterial({
				color:
					pinData.source === "divar"
						? 0xdc2626
						: pinData.source === "sheypoor"
							? 0x2563eb
							: pinData.source === "kilid"
								? 0x7c3aed
								: 0x059669,
				emissive:
					pinData.source === "divar"
						? 0x7f1d1d
						: pinData.source === "sheypoor"
							? 0x1e3a8a
							: pinData.source === "kilid"
								? 0x4c1d95
								: 0x064e3b,
				emissiveIntensity: 0.8,
				roughness: 0.2,
				metalness: 0.8,
			});
			const coneMesh = new THREE.Mesh(pinGeo, pinMat);
			pinGroup.add(coneMesh);

			// Pulsating Ground Ring
			const ringMat = new THREE.MeshBasicMaterial({
				color: isDark ? 0xe58a13 : 0xf59e0b,
				side: THREE.DoubleSide,
				transparent: true,
				opacity: 0.7,
			});
			const ringMesh = new THREE.Mesh(ringGeo, ringMat);
			ringMesh.position.y = -pinData.position[1] + 0.05;
			pinGroup.add(ringMesh);

			// Upward Light Beam / Stem
			const stemGeo = new THREE.CylinderGeometry(
				0.015,
				0.015,
				pinData.position[1] - 0.05,
				8,
			);
			stemGeo.translate(0, -(pinData.position[1] - 0.05) / 2, 0);
			const stemMat = new THREE.MeshBasicMaterial({
				color: isDark ? 0xe58a13 : 0xf59e0b,
				transparent: true,
				opacity: 0.4,
			});
			const stemMesh = new THREE.Mesh(stemGeo, stemMat);
			pinGroup.add(stemMesh);

			scene.add(pinGroup);
			pins.push(pinGroup);
		});

		// 10. Ambient Atmospheric Particles (Dust & Saffron Sparks)
		const particleCount = 1200;
		const particleGeo = new THREE.BufferGeometry();
		const particlePositions = new Float32Array(particleCount * 3);
		const particleColors = new Float32Array(particleCount * 3);

		for (let i = 0; i < particleCount; i++) {
			particlePositions[i * 3] = (Math.random() - 0.5) * 52;
			particlePositions[i * 3 + 1] = Math.random() * 9 + 0.2;
			particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 44;

			// Warm gold and cool cyan sparks
			if (Math.random() > 0.5) {
				particleColors[i * 3] = 0.9;
				particleColors[i * 3 + 1] = 0.6;
				particleColors[i * 3 + 2] = 0.1;
			} else {
				particleColors[i * 3] = 0.1;
				particleColors[i * 3 + 1] = 0.7;
				particleColors[i * 3 + 2] = 0.9;
			}
		}
		particleGeo.setAttribute(
			"position",
			new THREE.BufferAttribute(particlePositions, 3),
		);
		particleGeo.setAttribute(
			"color",
			new THREE.BufferAttribute(particleColors, 3),
		);

		const particleMat = new THREE.PointsMaterial({
			size: 0.075,
			vertexColors: true,
			transparent: true,
			opacity: isDark ? 0.75 : 0.5,
			blending: THREE.AdditiveBlending,
		});
		const particles = new THREE.Points(particleGeo, particleMat);
		scene.add(particles);

		// Store in ref
		sceneRef.current = {
			scene,
			camera,
			renderer,
			pins,
			particles,
			highwayLines,
			buildingMesh,
			currentScroll: 0,
			targetCameraPos: new THREE.Vector3(0, 11, 14),
			targetCameraLookAt: new THREE.Vector3(0, 0, 0),
			currentCameraPos: new THREE.Vector3(0, 11, 14),
			currentCameraLookAt: new THREE.Vector3(0, 0, 0),
			mousePos: { x: 0, y: 0, targetX: 0, targetY: 0 },
			raycaster: new THREE.Raycaster(),
			pointer: new THREE.Vector2(),
			hoveredPin: null,
		};

		// 11. Event Listeners (Mouse parallax + Resize)
		const handleMouseMove = (e: MouseEvent) => {
			if (!sceneRef.current) return;
			const rect = container.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
			const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
			sceneRef.current.mousePos.targetX = x;
			sceneRef.current.mousePos.targetY = y;
			sceneRef.current.pointer.x = x;
			sceneRef.current.pointer.y = y;
		};

		const handleResize = () => {
			if (!sceneRef.current || !container) return;
			const width = container.clientWidth;
			const height = container.clientHeight;
			const aspect = width / height;
			sceneRef.current.camera.aspect = aspect;
			sceneRef.current.camera.fov = aspect > 2.0 ? 38 : aspect < 1.0 ? 55 : 44;
			sceneRef.current.camera.updateProjectionMatrix();
			sceneRef.current.renderer.setSize(width, height);
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("resize", handleResize);

		// 12. Animation Loop (Zero-allocation in render cycle, no deprecated THREE.Clock)
		let animationFrameId: number;
		const startTime = performance.now();

		const render = (currentTime: number) => {
			animationFrameId = requestAnimationFrame(render);
			const ctx = sceneRef.current;
			if (!ctx) return;

			const elapsed = (currentTime - startTime) * 0.001;

			// 1. Mouse Lerp
			ctx.mousePos.x += (ctx.mousePos.targetX - ctx.mousePos.x) * 0.05;
			ctx.mousePos.y += (ctx.mousePos.targetY - ctx.mousePos.y) * 0.05;

			// 2. Scroll-driven camera choreographies (5 distinct cinematic stages)
			const p = ctx.currentScroll; // 0.0 to 1.0

			if (p < 0.25) {
				// Stage 0: Hero Overview (Wide high-angle isometric Tehran vista)
				const t = p / 0.25;
				ctx.targetCameraPos.set(
					THREE.MathUtils.lerp(0, -3.5, t) + ctx.mousePos.x * 1.2,
					THREE.MathUtils.lerp(10.5, 7.5, t) - ctx.mousePos.y * 0.8,
					THREE.MathUtils.lerp(13.5, 9.5, t),
				);
				ctx.targetCameraLookAt.set(
					THREE.MathUtils.lerp(0, -1.5, t),
					THREE.MathUtils.lerp(0, 0.8, t),
					THREE.MathUtils.lerp(0, -1.0, t),
				);
			} else if (p < 0.5) {
				// Stage 1: Cross-Portal Aggregation (Swoop into Shemiranat / Central dense cluster)
				const t = (p - 0.25) / 0.25;
				ctx.targetCameraPos.set(
					THREE.MathUtils.lerp(-3.5, 4.0, t) + ctx.mousePos.x * 0.8,
					THREE.MathUtils.lerp(7.5, 4.8, t) - ctx.mousePos.y * 0.6,
					THREE.MathUtils.lerp(9.5, 5.2, t),
				);
				ctx.targetCameraLookAt.set(
					THREE.MathUtils.lerp(-1.5, 1.0, t),
					THREE.MathUtils.lerp(0.8, 1.2, t),
					THREE.MathUtils.lerp(-1.0, -1.5, t),
				);
			} else if (p < 0.75) {
				// Stage 2: Geospatial District & Polygon Filtering (Top-down tilted perspective)
				const t = (p - 0.5) / 0.25;
				ctx.targetCameraPos.set(
					THREE.MathUtils.lerp(4.0, -2.0, t) + ctx.mousePos.x * 0.9,
					THREE.MathUtils.lerp(4.8, 8.5, t) - ctx.mousePos.y * 0.7,
					THREE.MathUtils.lerp(5.2, 7.0, t),
				);
				ctx.targetCameraLookAt.set(
					THREE.MathUtils.lerp(1.0, -0.5, t),
					THREE.MathUtils.lerp(1.2, 0.2, t),
					THREE.MathUtils.lerp(-1.5, 0.5, t),
				);
			} else {
				// Stage 3 & 4: Mortgage/Rent Calculator & Final CTA Gateway (Grand ascending perspective)
				const t = (p - 0.75) / 0.25;
				ctx.targetCameraPos.set(
					THREE.MathUtils.lerp(-2.0, 0, t) + ctx.mousePos.x * 1.5,
					THREE.MathUtils.lerp(8.5, 12.0, t) - ctx.mousePos.y * 0.9,
					THREE.MathUtils.lerp(7.0, 11.5, t),
				);
				ctx.targetCameraLookAt.set(
					THREE.MathUtils.lerp(-0.5, 0, t),
					THREE.MathUtils.lerp(0.2, 0, t),
					THREE.MathUtils.lerp(0.5, -2.0, t),
				);
			}

			// Smooth Camera interpolation
			ctx.currentCameraPos.lerp(ctx.targetCameraPos, 0.06);
			ctx.currentCameraLookAt.lerp(ctx.targetCameraLookAt, 0.06);
			ctx.camera.position.copy(ctx.currentCameraPos);
			ctx.camera.lookAt(ctx.currentCameraLookAt);

			// 3. Animate Pins (Idle float + pulsing rings)
			ctx.pins.forEach((pin, i) => {
				const time = elapsed * 2.5 + i * 0.8;
				pin.position.y =
					(pin.userData.pinData as NeighborhoodPin).position[1] +
					Math.sin(time) * 0.08;

				// Pulsing ring scale & opacity
				const ring = pin.children[1] as THREE.Mesh;
				if (ring) {
					const pulse = (elapsed * 1.5 + i * 0.4) % 1;
					ring.scale.setScalar(1 + pulse * 1.8);
					(ring.material as THREE.MeshBasicMaterial).opacity =
						(1 - pulse) * 0.8;
				}
			});

			// 4. Animate Particle Field (Drift upward and rotate gently)
			ctx.particles.rotation.y = elapsed * 0.02;

			// 5. Raycasting for Pin Hover Interactivity
			ctx.raycaster.setFromCamera(ctx.pointer, ctx.camera);
			const intersects = ctx.raycaster.intersectObjects(ctx.pins, true);

			if (intersects.length > 0) {
				let hitGroup: THREE.Group | null = null;
				let obj: THREE.Object3D | null = intersects[0].object;
				while (obj?.parent) {
					if (obj.userData?.pinData) {
						hitGroup = obj as THREE.Group;
						break;
					}
					obj = obj.parent;
				}

				if (hitGroup) {
					const pinData = hitGroup.userData.pinData as NeighborhoodPin;
					ctx.hoveredPin = pinData;

					// Project 3D position to 2D screen coordinates
					const tempV = new THREE.Vector3();
					hitGroup.getWorldPosition(tempV);
					tempV.y += 0.5;
					tempV.project(ctx.camera);

					const screenX = ((tempV.x + 1) * container.clientWidth) / 2;
					const screenY = ((-tempV.y + 1) * container.clientHeight) / 2;

					setHoveredPinData({ pin: pinData, screenX, screenY });
				}
			} else {
				if (ctx.hoveredPin) {
					ctx.hoveredPin = null;
					setHoveredPinData(null);
				}
			}

			// 6. Render WebGL frame
			ctx.renderer.render(ctx.scene, ctx.camera);
		};

		render(performance.now());

		// Cleanup on unmount (Strict GPU memory management)
		return () => {
			cancelAnimationFrame(animationFrameId);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("resize", handleResize);

			if (sceneRef.current) {
				const { renderer, scene } = sceneRef.current;
				renderer.dispose();
				if (container.contains(renderer.domElement)) {
					container.removeChild(renderer.domElement);
				}
				scene.traverse((obj) => {
					if (
						obj instanceof THREE.Mesh ||
						obj instanceof THREE.Line ||
						obj instanceof THREE.Points
					) {
						obj.geometry?.dispose();
						if (Array.isArray(obj.material)) {
							for (const m of obj.material) {
								m.dispose();
							}
						} else {
							obj.material?.dispose();
						}
					}
				});
				sceneRef.current = null;
			}
		};
	}, []);

	return (
		<div
			className="absolute inset-0 size-full overflow-hidden pointer-events-auto select-none"
			ref={containerRef}
		>
			{/* Floating 3D Hover Tooltip */}
			{hoveredPinData && (
				<div
					className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150"
					style={{
						left: `${hoveredPinData.screenX}px`,
						top: `${hoveredPinData.screenY - 12}px`,
					}}
					dir="rtl"
				>
					<div className="bg-background/95 backdrop-blur-md border border-primary/40 rounded-xl px-3.5 py-2.5 shadow-xl text-right min-w-[200px]">
						<div className="flex items-center justify-between gap-2 border-b border-border/60 pb-1.5 mb-1.5">
							<span className="font-bold text-xs text-foreground">
								{hoveredPinData.pin.persianName}
							</span>
							<span className="text-[10px] bg-primary/15 text-primary font-bold px-1.5 py-0.5 rounded-md">
								تهران
							</span>
						</div>
						<div className="text-[11px] text-muted-foreground space-y-1">
							<div className="flex justify-between">
								<span>میانگین رهن:</span>
								<span className="font-semibold text-foreground">
									{hoveredPinData.pin.avgDeposit}
								</span>
							</div>
							<div className="flex justify-between">
								<span>میانگین اجاره:</span>
								<span className="font-semibold text-foreground">
									{hoveredPinData.pin.avgRent}
								</span>
							</div>
							<div className="flex justify-between text-primary text-[10px] pt-1">
								<span>آگهی‌های فعال:</span>
								<span className="font-bold">
									{hoveredPinData.pin.listingsCount} ملک
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
