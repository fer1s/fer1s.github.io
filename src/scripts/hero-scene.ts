import {
	BufferAttribute,
	BufferGeometry,
	EdgesGeometry,
	Group,
	IcosahedronGeometry,
	LineBasicMaterial,
	LineSegments,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	WebGLRenderer,
} from "three";

function hasWebGL() {
	try {
		const probe = document.createElement("canvas");
		const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
		if (!gl) return false;
		gl.getExtension("WEBGL_lose_context")?.loseContext();
		return true;
	} catch {
		return false;
	}
}

export function mountHero(canvas: HTMLCanvasElement): () => void {
	if (!hasWebGL()) return () => {};

	const small = window.matchMedia("(max-width: 767px)").matches;
	const lowEnd = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4;
	const count = small || lowEnd ? 70 : 150;
	const finePointer = window.matchMedia("(pointer: fine)").matches;

	const renderer = new WebGLRenderer({
		canvas,
		antialias: false,
		alpha: true,
		powerPreference: "low-power",
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.setClearColor(0x000000, 0);

	const scene = new Scene();
	const camera = new PerspectiveCamera(42, 1, 0.1, 40);
	camera.position.z = 7.2;

	const group = new Group();
	group.position.set(small ? 0.45 : 2.2, small ? 0.55 : 0.15, 0);
	group.scale.setScalar(small ? 0.58 : 0.92);
	scene.add(group);

	const solid = new IcosahedronGeometry(1.45, 0);
	const edges = new EdgesGeometry(solid);
	const wireMaterial = new LineBasicMaterial({
		color: 0x9ee8d2,
		transparent: true,
		opacity: 0.42,
	});
	const wire = new LineSegments(edges, wireMaterial);
	group.add(wire);

	const base = new Float32Array(count * 3);
	const phase = new Float32Array(count);
	const speed = new Float32Array(count);
	for (let i = 0; i < count; i++) {
		const theta = Math.random() * Math.PI * 2;
		const phi = Math.acos(2 * Math.random() - 1);
		const radius = 2.05 + Math.random() * 1.35;
		base[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
		base[i * 3 + 1] = Math.cos(phi) * radius * 0.7;
		base[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius * 0.82;
		phase[i] = Math.random() * Math.PI * 2;
		speed[i] = 0.22 + Math.random() * 0.45;
	}

	const positions = new Float32Array(base);
	const pointsGeometry = new BufferGeometry();
	pointsGeometry.setAttribute("position", new BufferAttribute(positions, 3));
	const pointsMaterial = new PointsMaterial({
		color: 0xd7f6ec,
		size: small ? 0.045 : 0.032,
		transparent: true,
		opacity: 0.55,
		depthWrite: false,
		sizeAttenuation: true,
	});
	group.add(new Points(pointsGeometry, pointsMaterial));

	const pairs = nearestPairs(base, count, small ? 36 : 72, 1.55);
	const linkPositions = new Float32Array(pairs.length * 6);
	const linkGeometry = new BufferGeometry();
	linkGeometry.setAttribute("position", new BufferAttribute(linkPositions, 3));
	const linkMaterial = new LineBasicMaterial({
		color: 0x7ee0c3,
		transparent: true,
		opacity: 0.16,
		depthWrite: false,
	});
	group.add(new LineSegments(linkGeometry, linkMaterial));

	const target = { x: 0, y: 0 };
	const current = { x: 0, y: 0 };
	const started = performance.now();

	const onPointer = (event: PointerEvent) => {
		target.x = (event.clientX / window.innerWidth - 0.5) * 0.36;
		target.y = (event.clientY / window.innerHeight - 0.5) * 0.18;
	};
	if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true });

	const resize = () => {
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		if (width === 0 || height === 0) return;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height, false);
	};

	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(canvas);
	resize();

	let frame = 0;
	let running = true;

	const render = (now: number) => {
		const elapsed = (now - started) / 1000;
		if (finePointer) {
			current.x += (target.x - current.x) * 0.045;
			current.y += (target.y - current.y) * 0.045;
		}

		wire.rotation.y = elapsed * 0.16;
		wire.rotation.x = elapsed * 0.09;
		group.rotation.y = elapsed * 0.05 + current.x;
		group.rotation.x = current.y * 0.6;

		for (let i = 0; i < count; i++) {
			const drift = elapsed * speed[i] + phase[i];
			positions[i * 3] = base[i * 3] + Math.sin(drift) * 0.16;
			positions[i * 3 + 1] = base[i * 3 + 1] + Math.cos(drift * 0.8) * 0.12;
			positions[i * 3 + 2] = base[i * 3 + 2] + Math.sin(drift * 0.55) * 0.1;
		}
		pointsGeometry.attributes.position.needsUpdate = true;

		for (let i = 0; i < pairs.length; i++) {
			const [a, b] = pairs[i];
			const offset = i * 6;
			linkPositions[offset] = positions[a * 3];
			linkPositions[offset + 1] = positions[a * 3 + 1];
			linkPositions[offset + 2] = positions[a * 3 + 2];
			linkPositions[offset + 3] = positions[b * 3];
			linkPositions[offset + 4] = positions[b * 3 + 1];
			linkPositions[offset + 5] = positions[b * 3 + 2];
		}
		linkGeometry.attributes.position.needsUpdate = true;

		renderer.render(scene, camera);
	};

	const loop = (now: number) => {
		if (!running) return;
		frame = requestAnimationFrame(loop);
		render(now);
	};
	frame = requestAnimationFrame(loop);

	const setRunning = (next: boolean) => {
		if (next === running) return;
		running = next;
		if (running) frame = requestAnimationFrame(loop);
		else cancelAnimationFrame(frame);
	};

	let isOnscreen = true;
	const onVisibility = () => {
		setRunning(!document.hidden && isOnscreen);
	};
	const intersection = new IntersectionObserver(([entry]) => {
		isOnscreen = Boolean(entry?.isIntersecting);
		setRunning(isOnscreen && !document.hidden);
	});
	intersection.observe(canvas);
	document.addEventListener("visibilitychange", onVisibility);

	return () => {
		running = false;
		cancelAnimationFrame(frame);
		resizeObserver.disconnect();
		intersection.disconnect();
		document.removeEventListener("visibilitychange", onVisibility);
		if (finePointer) window.removeEventListener("pointermove", onPointer);
		solid.dispose();
		edges.dispose();
		wireMaterial.dispose();
		pointsGeometry.dispose();
		pointsMaterial.dispose();
		linkGeometry.dispose();
		linkMaterial.dispose();
		renderer.dispose();
	};
}

function nearestPairs(base: Float32Array, count: number, limit: number, maxDist: number) {
	const pairs: Array<[number, number]> = [];
	const seen = new Set<string>();
	const maxDistSq = maxDist * maxDist;

	for (let i = 0; i < count && pairs.length < limit; i++) {
		let best = -1;
		let bestDist = maxDistSq;
		const ax = base[i * 3];
		const ay = base[i * 3 + 1];
		const az = base[i * 3 + 2];
		for (let j = 0; j < count; j++) {
			if (i === j) continue;
			const dx = ax - base[j * 3];
			const dy = ay - base[j * 3 + 1];
			const dz = az - base[j * 3 + 2];
			const dist = dx * dx + dy * dy + dz * dz;
			if (dist < bestDist) {
				bestDist = dist;
				best = j;
			}
		}
		if (best < 0) continue;
		const key = i < best ? `${i}-${best}` : `${best}-${i}`;
		if (seen.has(key)) continue;
		seen.add(key);
		pairs.push([i, best]);
	}

	return pairs;
}
