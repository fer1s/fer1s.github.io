let generation = 0;
let dispose: (() => void) | undefined;

async function startHero() {
	const current = ++generation;
	dispose?.();
	dispose = undefined;

	const canvas = document.querySelector("[data-hero-canvas]");
	if (!(canvas instanceof HTMLCanvasElement)) return;
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	const { mountHero } = await import("./hero-scene");
	if (current !== generation || !canvas.isConnected) return;
	dispose = mountHero(canvas);
}

startHero();
document.addEventListener("astro:page-load", () => {
	void startHero();
});
