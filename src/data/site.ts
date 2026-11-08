/** Base path with a trailing slash, for links and public assets. */
export const baseUrl = import.meta.env.BASE_URL.endsWith("/")
	? import.meta.env.BASE_URL
	: `${import.meta.env.BASE_URL}/`;

export const site = {
	name: "Jakub Molenda",
	role: "Full-stack Developer",
	lang: "pl",
	description:
		"Portfolio Jakuba Molendy - prezentacja projektów, umiejętności i doświadczenia w tworzeniu aplikacji internetowych oraz oprogramowania.",
	email: "feris@tutanota.com",
	github: "https://github.com/fer1s",
	linkedin: "",
} as const;
