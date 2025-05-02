import { EMBED_COMMANDS_MOCK, VIEW_DATA_MOCK } from "../../test/embed/longterm-note.testdata.js";
import { appConnector, setupPluginCallMock } from "../../../common-utils/embed-helpers.js";
import DragDropManager from "./DragDropManager.js";
import { canHighlightSection, TimeSectionAction, TimeSectionFormat, TimeSectionNote, TimeSectionOffset, TimeSectionTitle } from "./time-sections.js";


setupPluginCallMock(EMBED_COMMANDS_MOCK);
window.ViewData = window.ViewData || VIEW_DATA_MOCK;
window.START_OF_DAY_OFFSET = ViewData["START_OF_WEEK"] || 0;
window.VIEW_TYPE = ViewData["VIEW_TYPE"] || "horizon";
const taskDragDropManager = new DragDropManager();

class TimeSectionView {
	currentDate = new Date();
	viewType = "horizon";

	constructor(viewType) {
		const timeSectionsContainer = document.querySelector(".main-content");
		if (!timeSectionsContainer) throw Error("couldn't find place to put views...");
		this.viewType = viewType || "horizon";

		switch (viewType) {
			case "horizon":
				timeSectionsContainer.appendChild(this.createTimeSection("day"));
				timeSectionsContainer.appendChild(this.createTimeSection("week"));
				timeSectionsContainer.appendChild(this.createTimeSection("month"));
				timeSectionsContainer.appendChild(this.createTimeSection("year"));
				timeSectionsContainer.appendChild(this.createTimeSection("life"));
				break;
			case "years":
				for (let i = -2; i <= 2; i++)
					timeSectionsContainer.appendChild(this.createTimeSection("year", i.toString()));
				break;
			case "months":
				for (let i = -2; i <= 2; i++)
					timeSectionsContainer.appendChild(this.createTimeSection("month", i.toString()));
				break;
			case "weeks":
				for (let i = -2; i <= 2; i++)
					timeSectionsContainer.appendChild(this.createTimeSection("week", i.toString()));
				break;
			case "days":
				for (let i = -2; i <= 2; i++)
					timeSectionsContainer.appendChild(this.createTimeSection("day", i.toString()));
				break;
		}

		this.setupListeners();
		this.updateDate();
	}

	
	createTimeSection(sectionType, sectionOffset = "0") {
		const timeSectionEl = document.createElement("div");
		timeSectionEl.classList.add("time-section");
		timeSectionEl.dataset.section = sectionType;
		timeSectionEl.dataset.offset = sectionOffset;
		
		const sectionDate = getAdjustedDate(this.currentDate, sectionType, sectionOffset);

		timeSectionEl.innerHTML = `
			<div class="header">
				<h2>${TimeSectionTitle[sectionType]?.(sectionDate) || "Unknown"}</h2>
				<h3>${TimeSectionFormat[sectionType]?.(sectionDate)}</h3>
			</div>
			<div class="tasks"></div>
			${sectionType == "life" ? '' :
				`<div class="controls">
					<div class="time-controls button-group">
						<button class="time-control" data-time="-1">&lt;</button>
						<button class="time-control" data-time="0">Today</button>
						<button class="time-control" data-time="1">&gt;</button>
					</div>
				</div>`
			}
		`;

		return timeSectionEl;
	}

	setupListeners() {
		document.querySelectorAll("[data-section]").forEach((timeSectionEl) => {
			// get time
			const timeSection = timeSectionEl.dataset.section;
			const sectionDate = getAdjustedDate(this.currentDate, timeSection, timeSectionEl.dataset.offset);
	
			const tasksContainer = timeSectionEl.querySelector(".tasks");
	
			// drag & drop
			taskDragDropManager.addDropable(tasksContainer, {
				async onAdd(taskEl, taskData, dropIndex) {
					// move task input up
					const taskInputField = tasksContainer.querySelector(".task-input");
					if (taskInputField) tasksContainer.prepend(taskInputField);
	
					//console.log(timeSection, "got", taskData.content, "on", dropIndex);
					const noteName = TimeSectionNote[timeSection]?.(sectionDate);
					if (!noteName) throw Error("No note name: " + timeSection + " / " + sectionDate.toDateString());
					appConnector.moveNoteTask(noteName, taskData.uuid)
				}
			});
	
			// time controls
			timeSectionEl.querySelectorAll(".time-control[data-time]").forEach((timeControlEl) => {
				const timeAction = timeControlEl.dataset.time;
				timeControlEl.addEventListener("click", () => {
					const sectionAction = TimeSectionAction[timeSection]?.[timeAction];
					if (typeof sectionAction !== "function")
						throw Error("Unknown time section action: " + timeSection + " / " + timeAction);
	
					sectionAction(this.currentDate);
					this.updateDate();
				});
			});
		});
	}

	updateDate() {
		document.querySelectorAll("[data-section]").forEach((timeSectionEl) => {
			// get time
			const timeSection = timeSectionEl.dataset.section;
			const sectionDate = getAdjustedDate(this.currentDate, timeSection, timeSectionEl.dataset.offset);
	
			this.updateLabel(timeSectionEl, timeSection, sectionDate);
			this.updateTitle(timeSectionEl, timeSection, sectionDate);
			this.updateTasks(timeSectionEl, timeSection, sectionDate);
		});
	}

	updateLabel(timeSectionEl, timeSection, sectionDate) {
		const timeLabel = timeSectionEl.querySelector("h3");
		if (!timeLabel) return;

		const sectionFormat = TimeSectionFormat[timeSection];
		if (typeof sectionFormat !== "function") throw Error("Unknown time section: " + timeSection);

		timeLabel.textContent = sectionFormat(sectionDate);
	}
	updateTitle(timeSectionEl, timeSection, sectionDate) {
		const timeTitle = timeSectionEl.querySelector("h2");
		if (!timeTitle) return;

		const sectionTitle = TimeSectionTitle[timeSection];
		if (typeof sectionTitle !== "function") throw Error("Unknown time section: " + timeSection);

		timeTitle.textContent = sectionTitle(sectionDate);

		if (this.viewType !== "horizon") {
			timeTitle.classList.toggle("highlight", canHighlightSection(sectionDate, timeSection));
		}
	}
	updateTasks(timeSectionEl, timeSection, sectionDate) {
		const tasksContainer = timeSectionEl.querySelector(".tasks");
		if (!tasksContainer) return;
		
		Array.from(tasksContainer.children).forEach(el => el.remove());
		this.addSectionTasks(timeSection, sectionDate, tasksContainer).then(() => {
			this.addTaskInput(tasksContainer, async (taskText) => {
				const noteName = TimeSectionNote[timeSection]?.(sectionDate);
				if (!noteName) throw Error("No note name: " + timeSection + " / " + sectionDate.toDateString());
	
				let newTask = await appConnector.addNoteTask(noteName, taskText);
				if (!newTask) throw Error("Couldn't create task");
	
				this.addTask(tasksContainer, newTask);
				
				// move task input down
				const taskInputField = tasksContainer.querySelector(".task-input");
				if (taskInputField) tasksContainer.prepend(taskInputField);
			});
		});
	}
	
	async addSectionTasks(timeSection, date, tasksContainer) {
		const tasks = await appConnector.getNoteTasks(TimeSectionNote[timeSection](date));
		if (!tasks) return;
	
		tasks.forEach((task) => {
			this.addTask(tasksContainer, task);
		});
	}
	
	addTask(tasksContainer, taskData) {
		const newTaskEl = document.createElement("div");
		const newTaskCheckbox = document.createElement("input");
		const newTaskNameEl = document.createElement("span");
	
		newTaskEl.classList.add("task");
		newTaskCheckbox.type = "checkbox";
		newTaskNameEl.classList.add("task-name");
	
		newTaskCheckbox.checked = taskData.completedAt != null;
		newTaskEl.classList.toggle("checked", newTaskCheckbox.checked);
		newTaskEl.classList.toggle("dismissed", taskData.dismissedAt != null);
		newTaskNameEl.textContent = taskData.content;
	
		newTaskEl.appendChild(newTaskCheckbox);
		newTaskEl.appendChild(newTaskNameEl);
		tasksContainer.prepend(newTaskEl);
	
		// setup listeners
		taskDragDropManager.addDragable(newTaskEl, taskData);
		newTaskCheckbox.addEventListener("change", () => {
			appConnector.toggleTask(taskData.uuid, newTaskCheckbox.checked);
			newTaskEl.classList.toggle("checked", newTaskCheckbox.checked);
	
			//move down if unchecked
			if (!newTaskCheckbox.checked) {
				newTaskEl.parentElement.appendChild(newTaskEl);
			}
		});
	}
	
	addTaskInput(tasksContainer, onCallback) {
		const newTaskEl = document.createElement("input");
		newTaskEl.placeholder = "Add task...";
		newTaskEl.classList.add("task-input");
	
		tasksContainer.prepend(newTaskEl);
	
		newTaskEl.addEventListener("change", () => {
			if (onCallback) onCallback(newTaskEl.value);
			newTaskEl.value = "";
		});
	}
}

// start point
new TimeSectionView(VIEW_TYPE);




function getAdjustedDate(date, sectionType, sectionOffset) {
	const timeOffset = parseInt(sectionOffset);
	let sectionDate = new Date(date);
	if (!isNaN(timeOffset) && timeOffset != 0) {
		const sectionOffsetFn = TimeSectionOffset[sectionType];
		if (typeof sectionOffsetFn !== "function") throw Error("Unknown time section: " + sectionType);

		sectionOffsetFn(sectionDate, timeOffset);
	}

	return sectionDate;
}