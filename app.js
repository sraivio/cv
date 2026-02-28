const HELSINKI_TIMEZONE = "Europe/Helsinki";
const MODE_DAY = "day";
const MODE_NIGHT = "night";

const SEASONS = ["spring", "summer", "autumn", "winter"];
const TIMES = [MODE_DAY, MODE_NIGHT];

const THEME_CLASSES = SEASONS.flatMap((season) =>
	TIMES.map((timeOfDay) => `theme-${season}-${timeOfDay}`)
);
const SCENE_CLASSES = SEASONS.flatMap((season) =>
	TIMES.map((timeOfDay) => `scene-${season}-${timeOfDay}`)
);

const sceneElement = document.getElementById("scene");
const bodyElement = document.body;
const themeNoteElement = document.getElementById("theme-note");
const shuffleButtonElement = document.getElementById("shuffle-theme");
const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));
const tabPanels = Array.from(document.querySelectorAll("[data-tab-panel]"));

let activeSeason = "summer";
let activeMode = MODE_DAY;
let currentThemeIndex = 0;

// All theme combinations in order
const ALL_THEMES = SEASONS.flatMap((season) =>
	TIMES.map((time) => ({ season, mode: time }))
);

function getHelsinkiDateParts() {
	const formatter = new Intl.DateTimeFormat("en-GB", {
		timeZone: HELSINKI_TIMEZONE,
		month: "2-digit",
		hour: "2-digit",
		hour12: false,
	});

	const parts = formatter.formatToParts(new Date());
	const values = {};

	for (const part of parts) {
		if (part.type !== "literal") {
			values[part.type] = part.value;
		}
	}

	return {
		month: Number.parseInt(values.month, 10),
		hour: Number.parseInt(values.hour, 10),
	};
}

function resolveSeasonFromMonth(month) {
	if (month >= 3 && month <= 5) {
		return "spring";
	}
	if (month >= 6 && month <= 8) {
		return "summer";
	}
	if (month >= 9 && month <= 11) {
		return "autumn";
	}
	return "winter";
}

function resolveModeFromHour(hour) {
	return hour >= 7 && hour < 20 ? MODE_DAY : MODE_NIGHT;
}

function applyTheme(season, mode, isTimeBased = false) {
	const themeClass = `theme-${season}-${mode}`;
	const sceneClass = `scene-${season}-${mode}`;

	activeSeason = season;
	activeMode = mode;

	bodyElement.classList.remove(...THEME_CLASSES);
	bodyElement.classList.add(themeClass);

	if (sceneElement) {
		sceneElement.classList.remove(...SCENE_CLASSES);
		sceneElement.classList.add(sceneClass);
		sceneElement.classList.toggle("scene-day", mode === MODE_DAY);
		sceneElement.classList.toggle("scene-night", mode === MODE_NIGHT);
	}

	if (themeNoteElement) {
		const seasonLabel = season[0].toUpperCase() + season.slice(1);
		const modeLabel = mode === MODE_DAY ? "Day" : "Night";
		const sourceLabel = isTimeBased
			? "based on Helsinki current season and time"
			: "browsed manually";
		themeNoteElement.textContent = `Theme is ${sourceLabel}. Active: ${seasonLabel} ${modeLabel}.`;
	}
}

function applyInitialThemeFromHelsinkiTime() {
	const { month, hour } = getHelsinkiDateParts();
	const season = resolveSeasonFromMonth(month);
	const mode = resolveModeFromHour(hour);
	applyTheme(season, mode, true);
}

function nextTheme() {
	currentThemeIndex = (currentThemeIndex + 1) % ALL_THEMES.length;
	const { season, mode } = ALL_THEMES[currentThemeIndex];
	applyTheme(season, mode);
}

function activateTab(tabName) {
	for (const button of tabButtons) {
		const isActive = button.dataset.tab === tabName;
		button.classList.toggle("is-active", isActive);
		button.setAttribute("aria-selected", isActive ? "true" : "false");
	}

	for (const panel of tabPanels) {
		const isActive = panel.dataset.tabPanel === tabName;
		panel.classList.toggle("is-active", isActive);
	}
}

function bindTabs() {
	for (const button of tabButtons) {
		button.addEventListener("click", () => {
			activateTab(button.dataset.tab);
		});
	}
}

applyInitialThemeFromHelsinkiTime();
bindTabs();

if (shuffleButtonElement) {
	shuffleButtonElement.addEventListener("click", nextTheme);
}
