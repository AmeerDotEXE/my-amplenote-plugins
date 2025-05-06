import { EMBED_COMMANDS_MOCK, DASHBOARD_DATA_MOCK } from "../test/embed/dashboard.testdata.js";
import { appConnector, setupPluginCallMock } from "../../common-utils/embed-helpers.js";
import RightClickMenu from "./RightClickMenu.js";

setupPluginCallMock(EMBED_COMMANDS_MOCK);
window.DashboardData = window.DashboardData || DASHBOARD_DATA_MOCK;
window.START_OF_DAY_OFFSET = DashboardData["START_OF_WEEK"] || 0;
let relationships = [];
initilizeWidget();

async function initilizeWidget() {
	relationships = await appConnector.getAllPeopleNotes();
	console.debug("recieved", relationships.length, "relationships");

	loadStats();
	initilizeAddMenu();
	loadReminders();
	loadRelationships();
}

function loadStats() {
	const reminderStatsEl = document.querySelector("#reminders-stats");
	const statsDurationEl = document.querySelector(".stats-duration");

	const remindersWaiting = relationships.filter(relationship =>
		relationship.remindWeek &&
		withinThisWeek(relationship.remindWeek) === 0
	).length;
	const interactionsToday = relationships.filter(relationship =>
		relationship.activities?.some(activity =>
			activity.type == "interaction" &&
			withinThisWeek(new Date(activity.date)) === 0
		)
	).length;

	reminderStatsEl.textContent = `${interactionsToday} / ${interactionsToday + remindersWaiting}`;

	const daysToNextWeek = (7 - new Date().getDay() + START_OF_DAY_OFFSET) % 7 || 7;
	statsDurationEl.textContent = `${daysToNextWeek} day${daysToNextWeek == 1 ? "" : "s"} left until end of week`;
}

function initilizeAddMenu() {
	const whoField = document.querySelector("#add-who");
	const whoSelectedField = document.querySelector("#add-who-selected");
	const whoUnselectBtn = document.querySelector("#add-who-unselect");
	const noteField = document.querySelector("#add-note");
	const typesBtn = document.querySelectorAll(".add-menu-buttons .grouped-option");
	const addBtn = document.querySelector("#add-menu-button");

	let selectedType = "note";
	let selectedRelationship = null;
	let typesValue = {};

	whoField.addEventListener("input", () => {
		//seatch relationships
		const result = relationships.filter(relationship => 
			relationship.name.toLowerCase()
			.includes(whoField.value.toLowerCase())
		);
		if (result.length > 1) return;
		if (result.length < 1) return;

		selectedRelationship = result[0];
		whoSelectedField.textContent = selectedRelationship.name;
		whoField.parentElement.classList.add("custom");
		whoField.value = "";
	});
	whoUnselectBtn.addEventListener("click", () => {
		selectedRelationship = null;
		whoField.parentElement.classList.remove("custom");
	});

	document.querySelectorAll(".add-menu-type").forEach(typeMenuEl => {
		const currentType = typeMenuEl.dataset.type;
		const optionsEl = typeMenuEl.querySelector(".add-menu-type-options");
		if (!optionsEl) return;
		let openCustomBtn = optionsEl.querySelector(".add-menu-type-option i");
		if (!openCustomBtn) return;
		openCustomBtn = openCustomBtn.parentElement;
		
		const customOptionEl = optionsEl.querySelector(".add-menu-type-custom");
		const customOptionInput = optionsEl.querySelector(".add-menu-type-custom input");
		const closeCustomBtn = optionsEl.querySelector(".add-menu-type-custom i");

		openCustomBtn.addEventListener("click", () => {
			optionsEl.classList.add("custom");
			typesValue[currentType] = null;
			Array.from(optionsEl.children)
			.filter(optionEl => optionEl != openCustomBtn && optionEl != customOptionEl)
			.forEach(optionEl => optionEl.classList.remove("active"));
		});
		closeCustomBtn.addEventListener("click", () => {
			optionsEl.classList.remove("custom");
			typesValue[currentType] = null;
		});
		customOptionInput.addEventListener("input", () => {
			typesValue[currentType] = customOptionInput.value;
		});

		Array.from(optionsEl.children)
		.filter(optionEl => optionEl != openCustomBtn && optionEl != customOptionEl)
		.forEach(optionEl => {
			optionEl.addEventListener("click", () => {
				typesValue[currentType] = optionEl.textContent;
				Array.from(optionsEl.children)
				.filter(optionEl => optionEl != openCustomBtn && optionEl != customOptionEl)
				.forEach(optionEl => optionEl.classList.remove("active"));
				optionEl.classList.add("active");
			});
		});
	});

	typesBtn.forEach((typeBtn, btnIndex) => {
		typeBtn.addEventListener("click", () => {
			selectedType = typeBtn.dataset.type;
			document.querySelectorAll(`.add-menu-type[data-type]`).forEach(x => 
				x.classList.toggle("active", x.dataset.type == typeBtn.dataset.type)
			);
			typesBtn.forEach(x => x.classList.remove("active"));
			typeBtn.classList.add("active");
		});
	});

	let addingDisabled = false;
	const AutoRemindOffsets = {
		week: () => Date.now() + AutoRemindOffsets._dayOffset*7,
		weeks: (num) => Date.now() + AutoRemindOffsets._dayOffset*7*num,
		month: () => Date.now() + AutoRemindOffsets._dayOffset*30,
		months: (num) => Date.now() + AutoRemindOffsets._dayOffset*30*num,
		year: () => Date.now() + AutoRemindOffsets._dayOffset*365,
		years: (num) => Date.now() + AutoRemindOffsets._dayOffset*365*num,

		_dayOffset: 1000*60*60*24,
	};
	addBtn.addEventListener("click", async () => {
		if (addingDisabled) return;

		// read who & note fields
		if (selectedRelationship == null) return;

		const newActivity = {
			type: selectedType,
			relationship: selectedRelationship,
			date: Date.now(),
			note: noteField.value || "empty",
		};

		// get type spesific data
		switch (selectedType) {
			case "interaction":
				newActivity.method = typesValue.interaction || "Text";
				break;
			case "reminder":
				newActivity.date = typesValue.reminder || "Today";
				break;
		}

		// clear fields
		whoUnselectBtn.click();
		noteField.value = "";

		// disable button
		addingDisabled = true;
		addBtn.style.opacity = "0.4";

		// send to backend & update it locally
		console.debug("sending relationship activity", newActivity);
		switch (newActivity.type) {
			case "note":
				await appConnector.addActivity(newActivity);
				newActivity.relationship.activities.unshift({
					"type": "note", "date": Date.now(),
					"note": newActivity.note,
				});
				break;
			case "interaction":
				await appConnector.addActivity(newActivity);
				newActivity.relationship.activities.unshift({
					"type": "interaction",
					"date": Date.now(),
					"note": newActivity.note,
					"method": newActivity.method,
				});
				// update remind week according to auto remind
				if (newActivity.relationship.autoRemind?.toLowerCase().startsWith("every ")) {
					const remindType = newActivity.relationship.autoRemind.trim().split(" ").at(-1);
					const remindOffset = parseInt(newActivity.relationship.autoRemind.trim().split(" ").at(-2));
					newActivity.relationship.remindWeek = AutoRemindOffsets[remindType](remindOffset);
				}
				break;
			case "reminder":
				newActivity.relationship.reminders = await appConnector.addReminder(newActivity);
				break;
		}

		// enable button
		addingDisabled = false;
		addBtn.style.opacity = "1";

		// update lists
		loadStats();
		updateRelationshipList(relationships);
		updateReminderList(relationships);
	});
}

function loadReminders() {
	const reminderTabsEl = document.querySelectorAll("#reminder-tabs .tab-btn");
	const remindersEl = document.querySelector("#reminders");

	let selectedFilter = 0;
	updateList(relationships);
	window.updateReminderList = updateList;

	reminderTabsEl.forEach((reminderTab, tabIndex) => {
		reminderTab.addEventListener("click", () => {
			selectedFilter = tabIndex - 1;
			reminderTabsEl.forEach(x => x.classList.remove("active"));
			reminderTab.classList.add("active");
			updateList(relationships);
		});
	});

	function updateList(relationships) {
		Array.from(remindersEl.children).forEach(x => x.remove());

		// add auto remind
		relationships
		.filter(relationship => 
			relationship.remindWeek &&
			withinThisWeek(relationship.remindWeek) === selectedFilter
		)
		.forEach(relationship => {
			remindersEl.appendChild(
				createPersonEl(relationship,
					createPersonDetails({
						type: "date",
						weekDay: relationship.remindWeek,
					}), {
						hideOptions: true,
					}
				)
			);
		});

		// add reminders
		relationships
		.forEach(relationship => {
			relationship.reminders
			.filter(reminder =>
				reminder.completedAt == null && reminder.startAt != null &&
				withinThisWeek(reminder.startAt * 1000) === selectedFilter
			)
			.forEach(reminder => {
				remindersEl.appendChild(
					createPersonEl(relationship,
						createPersonDetails({
							type: "time",
							text: dateToRelativeText(reminder.startAt * 1000, {
								includeTime: true,
							}),
						}), {
							hideOptions: reminder.uuid == null,
							interactionText: reminder.text.slice(0, 40),
							/** @param {RightClickMenu} contextMenu */
							createOptions: (contextMenu) => {
								contextMenu.addButton("Check Reminder", async () => {
									relationship.reminders = await appConnector.completeReminder(relationship.uuid, reminder.uuid);
									updateList(relationships);
								});
								contextMenu.addButton("Delete Reminder", async () => {
									relationship.reminders = await appConnector.removeReminder(relationship.uuid, reminder.uuid);
									updateList(relationships);
								});
							},
						}
					)
				);
			});
		});
	}
}

function loadRelationships() {
	const relationshipsSearchEl = document.querySelector("#search-relationships");
	const relationshipsFilterBtn = document.querySelector("#search-rs-filter");
	const relationshipsEl = document.querySelector("#relationships");

	let selectedFrequency = null;
	let selectedTag = null;
	updateList(relationships);
	window.updateRelationshipList = updateList;

	relationshipsSearchEl.addEventListener("input", () => {
		updateList(relationships);
	});
	new RightClickMenu(relationshipsFilterBtn, {
		allowClicking: true,
		leftSided: true,
	})
	.addButton("All", () => {
		selectedFrequency = null;
		selectedTag = null;
		updateList(relationships);
	})
	.addButton("Frequencies", (event) => {
		const frequenciesMenu = new RightClickMenu(null, {
			leftSided: true,
		});
		// creates a list of unique frequencies / auto remind
		Object.keys(relationships.map(x => x.autoRemind).reduce((a, c) => {
			c = c.toLowerCase();
			a[c] = (a[c] || 0) + 1;
			return a;
		}, {})).forEach(frequency => frequenciesMenu.addButton(frequency, () => {
			selectedFrequency = frequency;
			updateList(relationships);
		}));
		frequenciesMenu.openMenu(event.clientX, event.clientY);
	})
	.addButton("Tags", (event) => {
		const tagsMenu = new RightClickMenu(null, {
			leftSided: true,
		})
		// creates a list of unique tags
		Object.keys(relationships.map(x => x.tags).reduce((a, c) => {
			c = c || [];
			for (const x of c) {
				const y = x.split("/").slice(1).join("/");
				if (!y) continue;
				a[y] = (a[y] || 0) + 1;
			}
			return a;
		}, {})).forEach(tag => tagsMenu.addButton(tag, () => {
			selectedTag = tag;
			updateList(relationships);
		}));
		tagsMenu.openMenu(event.clientX, event.clientY);
	});
	
	function updateList(relationships) {
		Array.from(relationshipsEl.children).forEach(x => x.remove());

		relationships
		.filter(relationship => 
			selectedTag == null || relationship.tags.some(tag => 
				tag.split("/").slice(1).join("/") == selectedTag
			)
		)
		.filter(relationship => 
			selectedFrequency == null || relationship.autoRemind.toLowerCase() == selectedFrequency
		)
		.filter(relationship => 
			relationship.name.toLowerCase()
			.includes(relationshipsSearchEl.value.toLowerCase())
		)
		.forEach(relationship => {
			relationshipsEl.appendChild(
				createPersonEl(relationship,
					createPersonDetails({
						type: "frequency",
						text: relationship.autoRemind,
					}), {
						hideOptions: relationship.uuid == null,
						/** @param {RightClickMenu} contextMenu */
						createOptions: (contextMenu) => {
							contextMenu.options.leftSided = true;
							contextMenu.addButton("Open Note", async () => {
								await appConnector.navigateToNote(relationship.uuid);
							});
							contextMenu.addButton("Update Relationship", async () => {
								const index = relationships.findIndex(x => x.uuid == relationship.uuid);
								if (index == -1) throw Error("relationship isn't in list");
								relationships[index] = await appConnector.getNoteRelationship(relationship.uuid);

								loadStats();
								updateRelationshipList(relationships);
								updateReminderList(relationships);
							});
						},
					}
				)
			);
		});
	}
}

function createPersonEl(personData, detailsEl, options = {}) {
	const personEl = document.createElement("div");
	const avatarEl = document.createElement(personData.avatar ? "img" : "div");
	const personInfoEl = document.createElement("div");
	const personNameEl = document.createElement("div");
	const lastInteractionEl = document.createElement("div");
	const lastInteractionIconEl = document.createElement("i");
	const lastInteractionTextEl = document.createElement("div");
	const optionsIconEl = document.createElement("i");

	personEl.classList.add("person");
	avatarEl.classList.add("avatar");
	if (personData.avatar) avatarEl.loading = "lazy";
	personInfoEl.classList.add("person-info");
	personNameEl.classList.add("person-name");
	lastInteractionEl.classList.add("last-interaction");
	lastInteractionIconEl.classList.add("material-icons");
	optionsIconEl.classList.add("material-icons", "person-options");

	let lastInteraction = personData.activities.filter(x => x.type == "interaction")[0]?.date;
	if (lastInteraction) {
		lastInteraction = dateToRelativeText(lastInteraction);
	}
	else lastInteraction = "Never"

	if (personData.avatar) avatarEl.src = personData.avatar;
	personNameEl.textContent = personData.name;
	lastInteractionIconEl.textContent = "chat_bubble";
	lastInteractionTextEl.textContent = lastInteraction;
	if (options.interactionText?.length > 0) lastInteractionTextEl.textContent = options.interactionText;
	else lastInteractionTextEl.textContent = lastInteraction;
	optionsIconEl.textContent = "more_horiz";

	lastInteractionEl.appendChild(lastInteractionIconEl);
	lastInteractionEl.appendChild(lastInteractionTextEl);
	personInfoEl.appendChild(personNameEl);
	if (detailsEl) personInfoEl.appendChild(detailsEl);
	personInfoEl.appendChild(lastInteractionEl);
	personEl.appendChild(avatarEl);
	personEl.appendChild(personInfoEl);
	if (options.hideOptions != true) personEl.appendChild(optionsIconEl);

	if (options.createOptions) {
		const contextMenu = new RightClickMenu(optionsIconEl, {
			allowClicking: true,
		});
		options.createOptions(contextMenu);
	}

	return personEl;
}

function createPersonDetails(detailsData) {
	const personDetailsEl = document.createElement("div");
	const personDetailsIconEl = document.createElement("i");
	const personDetailsTextEl = document.createElement("div");

	personDetailsEl.classList.add("person-details");
	personDetailsIconEl.classList.add("material-icons");

	if (detailsData.type == "date") {
		personDetailsIconEl.textContent = "calendar_today";

		const _months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		const newDate = new Date(detailsData.weekDay);
		let weekOffset = (newDate.getDay() - START_OF_DAY_OFFSET + 7) % 7;

		newDate.setDate(newDate.getDate() - weekOffset);
		const weekStart = newDate.getDate();
		const monthStart = _months[newDate.getMonth()].slice(0, 3);

		newDate.setDate(weekStart + 6);
		const weekEnd = newDate.getDate().toString().padStart(2, "0");
		const monthEnd = _months[newDate.getMonth()].slice(0, 3);

		personDetailsTextEl.textContent = `${weekStart.toString().padStart(2, "0")}${monthStart != monthEnd ? ` ${monthStart}` : ""}-${weekEnd} ${monthEnd}`;
	} else if (detailsData.type == "time") {
		personDetailsIconEl.textContent = "calendar_today";
		personDetailsTextEl.textContent = detailsData.text;
	} else if (detailsData.type == "frequency") {
		personDetailsIconEl.textContent = "schedule";
		personDetailsTextEl.textContent = detailsData.text;
	}

	personDetailsEl.appendChild(personDetailsIconEl);
	personDetailsEl.appendChild(personDetailsTextEl);

	return personDetailsEl;
}




/**
 * 
 * @param {Date} date 
 * @returns -1 missed | 0 this week | 1 upcoming
 */
function withinThisWeek(date) {
	const today = Date.now();
	const newDate = new Date(date);
	let weekOffset = (newDate.getDay() - START_OF_DAY_OFFSET + 7) % 7;

	newDate.setDate(newDate.getDate() - weekOffset);
	if (newDate - today > 0) return 1;
	newDate.setDate(newDate.getDate() + 7);
	if (newDate - today > 0) return 0;
	return -1;
}

function dateToRelativeText(_date, { includeTime = false } = {}) {
	const date = new Date(_date);
	const timeDiff = Date.now() - date;
	if (isDateToday(date)) {
		if (includeTime) return date.toLocaleTimeString();
		return "Today";
	} else if (isDateToday(date, 1)) {
		return "Tomorrow";
	} else if (isDateToday(date, -1)) {
		return "Yesterday";
	} else if (timeDiff > 0 && Math.abs(timeDiff) < 1000*60*60*24*20) {
		return `${Math.floor((timeDiff) / (1000*60*60*24))} days ago`;
	} else if (date.getFullYear() == new Date().getFullYear()) {
		return date.toDateString().slice(4, -5);
	} else {
		return date.toDateString().slice(4);
	}
}

function isDateToday(date, offset = 0) {
	const today = new Date();
	today.setDate(today.getDate() + offset);

	let isToday = true;
	if (isToday && date.getDate() != today.getDate()) isToday = false;
	if (isToday && date.getMonth() != today.getMonth()) isToday = false;
	if (isToday && date.getFullYear() != today.getFullYear()) isToday = false;
	return isToday;
}