function initCards() {
	document.querySelectorAll("[data-card]").forEach((card) => {
		if (!(card instanceof HTMLElement) || card.dataset.bound === "true") return;
		if (!window.matchMedia("(pointer: fine)").matches) return;

		card.dataset.bound = "true";
		card.addEventListener("pointermove", (event) => {
			if (event.pointerType !== "mouse") return;
			const rect = card.getBoundingClientRect();
			card.style.setProperty("--x", `${event.clientX - rect.left}px`);
			card.style.setProperty("--y", `${event.clientY - rect.top}px`);
		});
	});
}

initCards();
document.addEventListener("astro:page-load", initCards);
