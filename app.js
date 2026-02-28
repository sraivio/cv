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

// ============================================
// SKILL BUBBLES - Mouse avoidance with collision
// ============================================
// SKILL BUBBLES - Static vertical list, best skills top
(function initSkillBubbles() {
	const container = document.getElementById("skills-bubbles");
	if (!container) return;

	// Get bubbles and sort by skill level (descending)
	const bubbles = Array.from(container.querySelectorAll(".skill-bubble"));
	if (bubbles.length === 0) return;

	bubbles.sort((a, b) => {
		const levelA = parseInt(a.getAttribute("data-level"), 10) || 0;
		const levelB = parseInt(b.getAttribute("data-level"), 10) || 0;
		return levelB - levelA;
	});

	// Remove all children from container and re-append in sorted order with level separators
	while (container.firstChild) container.removeChild(container.firstChild);

	let lastLevel = null;
	bubbles.forEach(bubble => {
		const level = parseInt(bubble.getAttribute("data-level"), 10) || 0;
		if (lastLevel !== null && level !== lastLevel) {
			const spacer = document.createElement("div");
			spacer.className = "skill-level-spacer";
			container.appendChild(spacer);
		}
		container.appendChild(bubble);
		lastLevel = level;
	});

	// Set static vertical list style
	bubbles.forEach(bubble => {
		bubble.style.position = "static";
		bubble.style.left = "";
		bubble.style.top = "";
		bubble.style.margin = "0.5rem 0.5rem";
		bubble.style.width = "auto";
		bubble.style.maxWidth = "320px";
		bubble.style.display = "inline-flex";
		bubble.style.verticalAlign = "top";
	});
	})();

// EXPERIENCE CARDS - Sort by end date, "ongoing" first
// ====================================================
(function sortExperienceCards() {
	const container = document.getElementById("experience-cards");
	if (!container) return;

	const cards = Array.from(container.querySelectorAll(".experience-card"));
	if (cards.length === 0) return;

	cards.sort((a, b) => {
		const endA = (a.getAttribute("data-end") || "").toLowerCase();
		const endB = (b.getAttribute("data-end") || "").toLowerCase();

		if (endA === "ongoing" && endB !== "ongoing") return -1;
		if (endB === "ongoing" && endA !== "ongoing") return 1;
		if (endA === "ongoing" && endB === "ongoing") return 0;

		// Parse YYYY-MM and compare descending (newest first)
		return endB.localeCompare(endA);
	});

	cards.forEach(card => container.appendChild(card));
})();
