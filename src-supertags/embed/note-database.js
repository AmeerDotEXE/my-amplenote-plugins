import { EMBED_COMMANDS_MOCK, DATABASE_DATA_MOCK } from "../test/embed/note-database.testdata.js";
import { appConnector, setupPluginCallMock } from "../../common-utils/embed-helpers.js";
import { hideEmbedLoader, showEmbedLoader } from "../../common-utils/embed-ui.js";
import { VIEW_CLASSES } from "./views/shared.js";

showEmbedLoader();
setupPluginCallMock(EMBED_COMMANDS_MOCK);
window.DatabaseData = window.DatabaseData || DATABASE_DATA_MOCK;
window.supertagUUID = window.DatabaseData.supertagUUID;
let DatabaseSettings = null;
let DatabaseValues = null;
initilizeWidget();


async function initilizeWidget() {
	DatabaseSettings = await appConnector.getSupertagDatabase(supertagUUID);
	DatabaseValues = await appConnector.getSupertags(supertagUUID);
	if (DatabaseValues == null) DatabaseValues = { results: [] };

	DatabaseValues.results.forEach(supertag => {
		supertag.properties = parseSupertagPropertiesFromContent(supertag.content);
	});
	console.log(DatabaseValues.results);

	// special fields
	if (DatabaseSettings.properties["checkbox"]) DatabaseSettings.properties["checkbox"].type = "checkbox";

	initilizeViews();
	hideEmbedLoader();
}

function initilizeViews() {
	// load buttons
	const viewsbar = document.querySelector(".views-bar");
	DatabaseSettings.views.reverse().forEach(view => {
		const viewClass = VIEW_CLASSES[view.type];
		if (!viewClass) throw Error("Unknown view type: " + viewClass);

		const viewButtonEl = document.createElement("div");
		const viewButtonIconEl = document.createElement("span");
		const viewButtonTextEl = document.createElement("span");

		viewButtonEl.classList.add("view-button");
		viewButtonIconEl.classList.add("material-icons");
		viewButtonTextEl.classList.add("view-name");

		viewButtonIconEl.textContent = viewClass.icon;
		viewButtonTextEl.textContent = view.name || "Untitled";

		viewButtonEl.appendChild(viewButtonIconEl);
		viewButtonEl.appendChild(viewButtonTextEl);

		viewsbar.prepend(viewButtonEl);

		viewButtonEl.addEventListener("click", () => {
			document.querySelector(".view-button.active")?.classList.remove("active");
			viewButtonEl.classList.add("active");
			new viewClass({
				DatabaseSettings,
				ViewData: view,
			}).RefreshValues(DatabaseValues);
		});
	});

	// select view
	const firstViewButtonEl = document.querySelector(".view-button");
	if (!firstViewButtonEl) return;

	firstViewButtonEl.click();
}

// parses content in supertag and returns properties object
function parseSupertagPropertiesFromContent(_content) {
	let properties = {};
	const titleProperty = Object.keys(DatabaseSettings.properties).find(x => DatabaseSettings.properties[x]?.type === "title");
	let content = _content.trim();

	// ignore bullet items
	if (content.startsWith("- ")) content = content.slice(2).trim();

	// check if task
	const isTask = ["[ ]", "[x]"].includes(content.slice(0, 3).toLowerCase());
	let isTaskChecked = false;
	if (isTask) {
		isTaskChecked = content[1].toLowerCase() == 'x';
		content = content.slice(3).trim();
	}
	
	// title - remove/format tags
	let title = content
		.replace(/^\s*\[[^\]]+\]\([^\)]+\)/gm, "") // tags at the start
		.replace(/\[[^\]]+\]\([^\)]+\)\s*$/gm, "") // tags at the end
		.replace(/\[([^\]]+)\]\([^\)]+\)/gm, "$1") // tags in the middle
		.replace(/\<\!\-\-.*\-\-\>/gm, "") // hidden data <!-- -->
		.trim()
	;

	// read properties from url
	let propertiesUri = content.match(/\[([^\]]+)\]\([^\)]+\)/gm)?.
		filter(str => 
			str.toLowerCase().includes(
				"notes/"+supertagUUID
			)
		)
		[0]?.split("?")[1]?.slice(0, -1)
	;

	// if properties URI exists, try parsing
	if (propertiesUri?.length > 0) {
		try {
			properties = JSON.parse(new URLSearchParams(propertiesUri).get("supertag"));
		} catch {}
		finally {
			properties = properties || {};
		}
	}

	// fill special fields //
	//checkbox
	if (isTask) {
		properties.checkbox = {
			checkbox: isTaskChecked,
		};
	}
	//title
	properties[titleProperty] = {
		title: title,
	};

	return properties;
}