let observer: IntersectionObserver | undefined;

function initReveal() {
	observer?.disconnect();

	document.querySelectorAll("[data-reveal-group]").forEach((group) => {
		group.querySelectorAll("[data-reveal]").forEach((item, index) => {
			if (item instanceof HTMLElement) {
				item.style.setProperty("--reveal-index", String(index));
			}
		});
	});

	const pending = [...document.querySelectorAll("[data-reveal]")].filter(
		(node) => !node.classList.contains("is-visible"),
	);
	if (pending.length === 0) return;

	const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (reduce) {
		pending.forEach((node) => node.classList.add("is-visible"));
		return;
	}

	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add("is-visible");
				observer?.unobserve(entry.target);
			}
		},
		{ threshold: 0.16 },
	);

	for (const node of pending) observer.observe(node);
}

initReveal();
document.addEventListener("astro:page-load", initReveal);
