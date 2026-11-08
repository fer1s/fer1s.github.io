let cleanup: (() => void) | undefined;

function initNav() {
	cleanup?.();

	const header = document.querySelector("[data-header]");
	if (!(header instanceof HTMLElement)) return;

	const toggle = header.querySelector("[data-nav-toggle]");
	const menu = header.querySelector("#nav-menu");

	const onScroll = () => {
		header.classList.toggle("is-scrolled", window.scrollY > 8);
	};

	const setOpen = (open: boolean) => {
		header.classList.toggle("is-open", open);
		if (toggle instanceof HTMLButtonElement) {
			toggle.setAttribute("aria-expanded", String(open));
		}
	};

	const onToggle = () => {
		setOpen(!header.classList.contains("is-open"));
	};

	const onKey = (event: KeyboardEvent) => {
		if (event.key === "Escape") setOpen(false);
	};

	const onLink = () => setOpen(false);

	onScroll();
	// Viewport scroll is dispatched on the document. Capture catches it even when
	// the event does not reach window.
	document.addEventListener("scroll", onScroll, { passive: true, capture: true });
	toggle?.addEventListener("click", onToggle);
	document.addEventListener("keydown", onKey);
	menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", onLink));

	cleanup = () => {
		document.removeEventListener("scroll", onScroll, { capture: true });
		toggle?.removeEventListener("click", onToggle);
		document.removeEventListener("keydown", onKey);
		menu?.querySelectorAll("a").forEach((link) => link.removeEventListener("click", onLink));
		setOpen(false);
	};
}

initNav();
document.addEventListener("astro:page-load", initNav);
