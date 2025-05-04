/***
 * Source Code: https://github.com/AmeerDotEXE/my-amplenote-plugins
 * Author: AmeerDotEXE
 * Build: production
 * Target Folder: src-longterm
 ***/
(() => {
  // src-longterm/constants.js
  var SHOW_COMPLETED_TASKS_SETTING_DEFAULT = "true", START_OF_WEEK_SETTING_DEFAULT = "0", FILTER_TAGS_SETTING_DEFAULT = "", SHOW_COMPLETED_TASKS_SETTING = `Show Completed Tasks (default: ${SHOW_COMPLETED_TASKS_SETTING_DEFAULT})`, START_OF_WEEK_SETTING = `Start Of Week (default: ${START_OF_WEEK_SETTING_DEFAULT})`, FILTER_TAGS_SETTING = `Filter Tags (default: ${FILTER_TAGS_SETTING_DEFAULT})`;

  // inline-html:src-longterm/embed/longterm-note.html
  var longterm_note_default = `<!DOCTYPE html>\r
<html lang="en">\r
<head>\r
	<meta charset="UTF-8">\r
	<meta name="viewport" content="width=device-width, initial-scale=1.0">\r
\r
	<style>/* src-longterm/embed/longterm-note.css */
:root {
  --background-color: #192025;
  --text-color: white;
  --text-color-secondary: #aaa;
}
html,
body {
  height: 100%;
}
body {
  background-color: var(--background-color);
  color: var(--text-color);
  font-family:
    Franklin Gothic Medium,
    Arial Narrow,
    Arial,
    sans-serif;
  margin: 0;
}
.main-content {
  height: 100%;
  display: flex;
  margin: 0 .25vw;
}
.time-section {
  flex-grow: 1;
  width: 1px;
  display: flex;
  flex-direction: column;
}
.time-section:not(:last-child) {
  border-right: 1px solid #444;
}
.time-section .header {
  height: 6vw;
  padding: 1vw 1.2vw 0;
}
.time-section h2 {
  margin: .5vw 0;
  font-size: 2.5vw;
}
.time-section h2.highlight {
  color: #cce;
}
.time-section h3 {
  margin: 0;
  color: var(--text-color-secondary);
  font-weight: 500;
  font-size: 1.5vw;
}
.time-section .tasks {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: .8vw .8vw 0;
  gap: .5vw;
}
.time-section .tasks .task {
  border-radius: .6vw;
  padding: .4vw .6vw;
  user-select: none;
  display: flex;
  align-items: center;
  gap: .5vw;
  font-size: 1.5vw;
}
.time-section .tasks .task:hover {
  background-color: #80808040;
}
.time-section .tasks .task.dragging {
  background-color: #2aa84640;
}
.time-section .tasks .task input[type=checkbox] {
  appearance: none;
  width: 1.6vw;
  height: 1.5vw;
  border: 1px solid var(--text-color-secondary);
  margin: 0;
  border-radius: .4vw;
  cursor: pointer;
}
.time-section .tasks .task.checked,
.time-section .tasks .task.dismissed {
  opacity: .7;
}
.time-section .tasks .task.dismissed {
  text-decoration: line-through;
}
.time-section .tasks .task.checked input[type=checkbox] {
  background-color: var(--text-color-secondary);
}
.time-section .tasks .task span.task-name {
  width: 100%;
}
.time-section .tasks .task-input {
  background-color: transparent;
  color: var(--text-color);
  border-radius: .6vw;
  padding: .4vw .6vw .4vw 2.5vw;
  border: 0;
  outline: 0;
  font-size: 1.5vw;
}
.time-section .tasks .task-input:focus {
  outline: 1px solid #80808080;
}
.time-section .controls {
  padding: 0 1vw 1vw;
  display: flex;
  justify-content: center;
}
.time-section:not(:hover) .controls {
  display: none;
}
.time-section button.time-control {
  border: 0;
  padding: .4vw .8vw;
  background: #80808040;
  color: #fff;
  border-radius: .8vw;
  cursor: pointer;
  font-size: 1.5vw;
}
.time-section button.time-control:hover {
  background: #80808020;
}
.button-group {
  display: flex;
}
.button-group > button:not(:first-child) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.button-group > button:not(:last-child) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
</style>\r
</head>\r
<body>\r
	<div class="main-content"></div>\r
	\r
	<script>(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: !0, configurable: !0, writable: !0, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key != "symbol" ? key + "" : key, value);

  // src-longterm/test/embed/longterm-note.testdata.js
  var EMBED_COMMANDS_MOCK = {
    getNoteTasks: async (noteName) => noteName == "May 2025" ? null : noteName == "Week 18, 2025" ? [] : [
      {
        dismissedAt: Math.floor(Date.now() / 1e3),
        content: "app returned",
        hideUntil: null,
        important: !1,
        noteUUID: "33333333-2222-1111-9999-eeeeeeeeeeee",
        score: 1.1,
        startAt: null,
        urgent: !1,
        uuid: "cccccccc-8888-4444-bbbb-eeeeeeeeeeee"
      },
      {
        content: noteName,
        hideUntil: null,
        important: !1,
        noteUUID: "33333333-2222-1111-9999-eeeeeeeeeeee",
        score: 1.1,
        startAt: null,
        urgent: !1,
        uuid: "22222222-cccc-4444-aaaa-dddddddddddd"
      },
      {
        completedAt: Math.floor(Date.now() / 1e3),
        content: "3rd task",
        hideUntil: null,
        important: !1,
        noteUUID: "33333333-2222-1111-9999-eeeeeeeeeeee",
        score: 1.1,
        startAt: null,
        urgent: !1,
        uuid: "dddddddd-4444-4444-bbbb-dddddddddddd"
      }
    ],
    addNoteTask: async (noteName, taskText) => ({
      content: taskText,
      hideUntil: null,
      important: !1,
      noteUUID: "33333333-2222-1111-9999-eeeeeeeeeeee",
      score: 1.1,
      startAt: null,
      urgent: !1,
      uuid: "dddddddd-4444-4444-cccc-dddddddddddd"
    }),
    moveNoteTask: async (noteName, taskUUID) => !0,
    toggleTask: async (taskUUID, checked) => !0
  }, VIEW_DATA_MOCK = {
    VIEW_TYPE: "horizon",
    START_OF_WEEK: 1
  };

  // common-utils/embed-comunication.js
  function createCallAmplenotePluginMock(embedCommandsMock) {
    return async (commandName, ...args) => {
      if (commandName in embedCommandsMock)
        return await embedCommandsMock[commandName](...args);
      throw new Error(\`Unknown command: \${commandName}\`);
    };
  }
  function deserializeWithFunctions(str) {
    return JSON.parse(str, (key, value) => {
      if (typeof value == "string" && value.startsWith("__FUNCTION:")) {
        let functionBody = value.slice(11);
        return new Function(\`return \${functionBody}\`)();
      }
      return value;
    });
  }

  // common-utils/embed-helpers.js
  var setupPluginCallMock = (EMBED_COMMANDS_MOCK2) => {
    window.INJECTED_EMBED_COMMANDS_MOCK && (window.callAmplenotePlugin = createCallAmplenotePluginMock(deserializeWithFunctions(window.INJECTED_EMBED_COMMANDS_MOCK)));
  }, appConnector = new Proxy({}, {
    get: function(target, prop, receiver) {
      return prop in target ? target[prop] : async function(...args) {
        return await window.callAmplenotePlugin(prop, ...args);
      };
    }
  });

  // src-longterm/embed/scripts/DragDropManager.js
  var DragDropManager = class {
    constructor() {
      /** @type {HTMLElement} */
      __publicField(this, "draggingItem", null);
      /**
       * @type {{
       * onIndex: number;
       * onAdd?: (draggedEl, draggedData, dropIndex) => {};
       * }?}
       */
      __publicField(this, "droppingList", null);
    }
    /** @param {HTMLElement} element */
    addDragable(element, data) {
      element.draggable = !0, element.addEventListener("dragstart", (event) => {
        this.draggingItem = element, this.droppingList = null, element.classList.add("dragging");
      }), element.addEventListener("dragend", () => {
        if (this.draggingItem = null, element.classList.remove("dragging"), !this.droppingList) return;
        let dropIndex = this.droppingList.onIndex, handleAdding = this.droppingList.onAdd;
        typeof handleAdding == "function" && handleAdding(element, data, dropIndex);
      });
    }
    /** @param {HTMLElement} element */
    /**
     * 
     * @param {HTMLElement} element 
     * @param {{
     * onAdd?: (draggedEl: HTMLElement, draggedData, dropIndex: number | -1) => {};
     * }?} param1 
     */
    addDropable(element, {
      onAdd = null
    }) {
      element.addEventListener("dragover", (event) => {
        if (!this.draggingItem) return;
        event.preventDefault();
        let draggingOverItem = this._getDragAfterElement(element, event.clientY);
        draggingOverItem.element ? element.insertBefore(this.draggingItem, draggingOverItem.element) : element.appendChild(this.draggingItem), this.droppingList = {
          onIndex: draggingOverItem.elementIndex,
          onAdd
        };
      });
    }
    /**
     * 
     * @param {HTMLElement} container 
     * @param {number} dragPosY 
     * @returns element after the hovered position
     */
    _getDragAfterElement(container, dragPosY) {
      return Array.from(container.children).reduce((closest, child, childIndex) => {
        if (!child.draggable) return closest;
        let box = child.getBoundingClientRect(), offset = dragPosY - box.top - box.height / 2;
        return offset < 0 && offset > closest.offset ? { offset, elementIndex: childIndex, element: child } : closest;
      }, { offset: Number.NEGATIVE_INFINITY, elementIndex: -1, element: null });
    }
  };

  // src-longterm/embed/scripts/time-sections.js
  var TimeSectionFormat = {
    /** @param {Date} date */
    day: (date) => VIEW_TYPE == "days" ? \`\${TimeSectionFormat._months[date.getMonth()]} \${date.getDate().toString().padStart(2, "0")}\` : isDateToday(date) ? \`\${TimeSectionFormat._days[date.getDay()].slice(0, 3)}, \${date.getDate().toString().padStart(2, "0")} \${TimeSectionFormat._months[date.getMonth()]}\` : TimeSectionFormat._days[date.getDay()].slice(0, 3),
    /** @param {Date} date */
    week: (date) => {
      let newDate = new Date(date), weekOffset = (newDate.getDay() - START_OF_DAY_OFFSET + 7) % 7;
      newDate.setDate(newDate.getDate() - weekOffset);
      let weekStart = newDate.getDate(), monthStart = TimeSectionFormat._months[newDate.getMonth()].slice(0, 3);
      newDate.setDate(weekStart + 6);
      let weekEnd = newDate.getDate().toString().padStart(2, "0"), monthEnd = TimeSectionFormat._months[newDate.getMonth()].slice(0, 3);
      return \`\${weekStart.toString().padStart(2, "0")}\${monthStart != monthEnd ? \` \${monthStart}\` : ""}-\${weekEnd} \${monthEnd}\`;
    },
    /** @param {Date} date */
    month: (date) => VIEW_TYPE == "months" ? date.getFullYear() : TimeSectionFormat._months[date.getMonth()],
    /** @param {Date} date */
    year: (date) => VIEW_TYPE == "years" ? "" : date.getFullYear(),
    /** @param {Date} date */
    life: (date) => "",
    _days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saterday"],
    _months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  }, TimeSectionTitle = {
    /** @param {Date} date */
    day: (date) => VIEW_TYPE == "days" ? TimeSectionFormat._days[date.getDay()] : isDateToday(date) ? "Today" : \`\${TimeSectionFormat._months[date.getMonth()].slice(0, 3)} \${date.getDate().toString().padStart(2, "0")}\`,
    /** @param {Date} date */
    week: (date) => {
      if (VIEW_TYPE == "weeks") {
        let weekInYear = weeksInYear(date);
        return \`W\${weekInYear[1].toString().padStart(2, "0")}, \${weekInYear[0]}\`;
      }
      return "Week";
    },
    /** @param {Date} date */
    month: (date) => VIEW_TYPE == "months" ? TimeSectionFormat._months[date.getMonth()] : "Month",
    /** @param {Date} date */
    year: (date) => VIEW_TYPE == "years" ? date.getFullYear() : "Year",
    /** @param {Date} date */
    life: (date) => "Life"
  }, TimeSectionAction = {
    day: {
      /** @param {Date} date */
      "-1": (date) => date.setDate(date.getDate() - 1),
      /** @param {Date} date */
      0: (date) => {
        let today = /* @__PURE__ */ new Date();
        date.setDate(today.getDate()), date.setMonth(today.getMonth()), date.setFullYear(today.getFullYear());
      },
      /** @param {Date} date */
      1: (date) => date.setDate(date.getDate() + 1)
    },
    week: {
      /** @param {Date} date */
      "-1": (date) => {
        date.setDate(date.getDate() - 7 - (date.getDay() - START_OF_DAY_OFFSET + 7) % 7);
      },
      /** @param {Date} date */
      0: (date) => {
        let today = /* @__PURE__ */ new Date();
        date.setDate(today.getDate()), date.setMonth(today.getMonth()), date.setFullYear(today.getFullYear());
      },
      /** @param {Date} date */
      1: (date) => date.setDate(date.getDate() + 7 - (date.getDay() - START_OF_DAY_OFFSET + 7) % 7)
    },
    month: {
      /** @param {Date} date */
      "-1": (date) => {
        date.setDate(1), date.setMonth(date.getMonth() - 1);
      },
      /** @param {Date} date */
      0: (date) => {
        let today = /* @__PURE__ */ new Date();
        date.setMonth(today.getMonth()), date.setFullYear(today.getFullYear());
      },
      /** @param {Date} date */
      1: (date) => {
        date.setDate(1), date.setMonth(date.getMonth() + 1);
      }
    },
    year: {
      /** @param {Date} date */
      "-1": (date) => {
        date.setDate(1), date.setMonth(0), date.setFullYear(date.getFullYear() - 1);
      },
      /** @param {Date} date */
      0: (date) => {
        let today = /* @__PURE__ */ new Date();
        date.setFullYear(today.getFullYear());
      },
      /** @param {Date} date */
      1: (date) => {
        date.setDate(1), date.setMonth(0), date.setFullYear(date.getFullYear() + 1);
      }
    }
  }, TimeSectionNote = {
    /** @param {Date} date */
    day: (date) => \`\${TimeSectionFormat._months[date.getMonth()]} \${date.getDate()}\${{ 1: "st", 2: "nd", 3: "rd" }[date.getDate().toString().slice(-1)] || "th"}, \${date.getFullYear()}\`,
    /** @param {Date} date */
    week: (date) => {
      let weekInYear = weeksInYear(date);
      return \`Week \${weekInYear[1]}, \${weekInYear[0]}\`;
    },
    /** @param {Date} date */
    month: (date) => \`\${TimeSectionFormat._months[date.getMonth()]} \${date.getFullYear()}\`,
    /** @param {Date} date */
    year: (date) => \`\${date.getFullYear()} goals\`,
    /** @param {Date} date */
    life: (date) => "Life goals"
  }, TimeSectionOffset = {
    /** @param {Date} date */
    day: (date, offset) => date.setDate(date.getDate() + offset),
    /** @param {Date} date */
    week: (date, offset) => date.setDate(date.getDate() + offset * 7),
    /** @param {Date} date */
    month: (date, offset) => date.setMonth(date.getMonth() + offset),
    /** @param {Date} date */
    year: (date, offset) => date.setFullYear(date.getFullYear() + offset)
  };
  function canHighlightSection(date, timeSection) {
    return timeSection == "life" ? !1 : isDateToday(date, {
      ignoreDays: ["week", "month", "year"].includes(timeSection),
      ignoreWeeks: ["month", "year"].includes(timeSection),
      ignoreMonths: ["week", "year"].includes(timeSection)
    });
  }
  function isDateToday(date, {
    ignoreDays = !1,
    ignoreWeeks = !0,
    ignoreMonths = !1
  } = {}) {
    let today = /* @__PURE__ */ new Date(), isToday = !0;
    return !ignoreDays && isToday && date.getDate() != today.getDate() && (isToday = !1), !ignoreWeeks && isToday && weeksInYear(date)[1] != weeksInYear(today)[1] && (isToday = !1), !ignoreMonths && isToday && date.getMonth() != today.getMonth() && (isToday = !1), isToday && date.getFullYear() != today.getFullYear() && (isToday = !1), isToday;
  }
  function weeksInYear(date) {
    d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())), d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)), weekNo = Math.ceil(((d - yearStart) / 864e5 + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
  }

  // src-longterm/embed/scripts/longterm-note.js
  setupPluginCallMock(EMBED_COMMANDS_MOCK);
  window.ViewData = window.ViewData || VIEW_DATA_MOCK;
  window.START_OF_DAY_OFFSET = ViewData.START_OF_WEEK || 0;
  window.VIEW_TYPE = ViewData.VIEW_TYPE || "horizon";
  var taskDragDropManager = new DragDropManager(), TimeSectionView = class {
    constructor(viewType) {
      __publicField(this, "currentDate", /* @__PURE__ */ new Date());
      __publicField(this, "viewType", "horizon");
      let timeSectionsContainer = document.querySelector(".main-content");
      if (!timeSectionsContainer) throw Error("couldn't find place to put views...");
      switch (this.viewType = viewType || "horizon", viewType) {
        case "horizon":
          timeSectionsContainer.appendChild(this.createTimeSection("day")), timeSectionsContainer.appendChild(this.createTimeSection("week")), timeSectionsContainer.appendChild(this.createTimeSection("month")), timeSectionsContainer.appendChild(this.createTimeSection("year")), timeSectionsContainer.appendChild(this.createTimeSection("life"));
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
      this.setupListeners(), this.updateDate();
    }
    createTimeSection(sectionType, sectionOffset = "0") {
      var _a, _b, _c, _d;
      let timeSectionEl = document.createElement("div");
      timeSectionEl.classList.add("time-section"), timeSectionEl.dataset.section = sectionType, timeSectionEl.dataset.offset = sectionOffset;
      let sectionDate = getAdjustedDate(this.currentDate, sectionType, sectionOffset);
      return timeSectionEl.innerHTML = \`
			<div class="header">
				<h2>\${((_b = (_a = TimeSectionTitle)[sectionType]) == null ? void 0 : _b.call(_a, sectionDate)) || "Unknown"}</h2>
				<h3>\${(_d = (_c = TimeSectionFormat)[sectionType]) == null ? void 0 : _d.call(_c, sectionDate)}</h3>
			</div>
			<div class="tasks"></div>
			\${sectionType == "life" ? "" : \`<div class="controls">
					<div class="time-controls button-group">
						<button class="time-control" data-time="-1">&lt;</button>
						<button class="time-control" data-time="0">Today</button>
						<button class="time-control" data-time="1">&gt;</button>
					</div>
				</div>\`}
		\`, timeSectionEl;
    }
    setupListeners() {
      document.querySelectorAll("[data-section]").forEach((timeSectionEl) => {
        let timeSection = timeSectionEl.dataset.section, sectionDate = getAdjustedDate(this.currentDate, timeSection, timeSectionEl.dataset.offset), tasksContainer = timeSectionEl.querySelector(".tasks");
        taskDragDropManager.addDropable(tasksContainer, {
          async onAdd(taskEl, taskData, dropIndex) {
            var _a, _b;
            let taskInputField = tasksContainer.querySelector(".task-input");
            taskInputField && tasksContainer.prepend(taskInputField);
            let noteName = (_b = (_a = TimeSectionNote)[timeSection]) == null ? void 0 : _b.call(_a, sectionDate);
            if (!noteName) throw Error("No note name: " + timeSection + " / " + sectionDate.toDateString());
            appConnector.moveNoteTask(noteName, taskData.uuid);
          }
        }), timeSectionEl.querySelectorAll(".time-control[data-time]").forEach((timeControlEl) => {
          let timeAction = timeControlEl.dataset.time;
          timeControlEl.addEventListener("click", () => {
            var _a;
            let sectionAction = (_a = TimeSectionAction[timeSection]) == null ? void 0 : _a[timeAction];
            if (typeof sectionAction != "function")
              throw Error("Unknown time section action: " + timeSection + " / " + timeAction);
            sectionAction(this.currentDate), this.updateDate();
          });
        });
      });
    }
    updateDate() {
      document.querySelectorAll("[data-section]").forEach((timeSectionEl) => {
        let timeSection = timeSectionEl.dataset.section, sectionDate = getAdjustedDate(this.currentDate, timeSection, timeSectionEl.dataset.offset);
        this.updateLabel(timeSectionEl, timeSection, sectionDate), this.updateTitle(timeSectionEl, timeSection, sectionDate), this.updateTasks(timeSectionEl, timeSection, sectionDate);
      });
    }
    updateLabel(timeSectionEl, timeSection, sectionDate) {
      let timeLabel = timeSectionEl.querySelector("h3");
      if (!timeLabel) return;
      let sectionFormat = TimeSectionFormat[timeSection];
      if (typeof sectionFormat != "function") throw Error("Unknown time section: " + timeSection);
      timeLabel.textContent = sectionFormat(sectionDate);
    }
    updateTitle(timeSectionEl, timeSection, sectionDate) {
      let timeTitle = timeSectionEl.querySelector("h2");
      if (!timeTitle) return;
      let sectionTitle = TimeSectionTitle[timeSection];
      if (typeof sectionTitle != "function") throw Error("Unknown time section: " + timeSection);
      timeTitle.textContent = sectionTitle(sectionDate), this.viewType !== "horizon" && timeTitle.classList.toggle("highlight", canHighlightSection(sectionDate, timeSection));
    }
    updateTasks(timeSectionEl, timeSection, sectionDate) {
      let tasksContainer = timeSectionEl.querySelector(".tasks");
      tasksContainer && (Array.from(tasksContainer.children).forEach((el) => el.remove()), this.addSectionTasks(timeSection, sectionDate, tasksContainer).then(() => {
        this.addTaskInput(tasksContainer, async (taskText) => {
          var _a, _b;
          let noteName = (_b = (_a = TimeSectionNote)[timeSection]) == null ? void 0 : _b.call(_a, sectionDate);
          if (!noteName) throw Error("No note name: " + timeSection + " / " + sectionDate.toDateString());
          let newTask = await appConnector.addNoteTask(noteName, taskText);
          if (!newTask) throw Error("Couldn't create task");
          this.addTask(tasksContainer, newTask);
          let taskInputField = tasksContainer.querySelector(".task-input");
          taskInputField && tasksContainer.prepend(taskInputField);
        });
      }));
    }
    async addSectionTasks(timeSection, date, tasksContainer) {
      let tasks = await appConnector.getNoteTasks(TimeSectionNote[timeSection](date));
      tasks && tasks.forEach((task) => {
        this.addTask(tasksContainer, task);
      });
    }
    addTask(tasksContainer, taskData) {
      let newTaskEl = document.createElement("div"), newTaskCheckbox = document.createElement("input"), newTaskNameEl = document.createElement("span");
      newTaskEl.classList.add("task"), newTaskCheckbox.type = "checkbox", newTaskNameEl.classList.add("task-name"), newTaskCheckbox.checked = taskData.completedAt != null, newTaskEl.classList.toggle("checked", newTaskCheckbox.checked), newTaskEl.classList.toggle("dismissed", taskData.dismissedAt != null), newTaskNameEl.textContent = taskData.content, newTaskEl.appendChild(newTaskCheckbox), newTaskEl.appendChild(newTaskNameEl), tasksContainer.prepend(newTaskEl), taskDragDropManager.addDragable(newTaskEl, taskData), newTaskCheckbox.addEventListener("change", () => {
        appConnector.toggleTask(taskData.uuid, newTaskCheckbox.checked), newTaskEl.classList.toggle("checked", newTaskCheckbox.checked), newTaskCheckbox.checked || newTaskEl.parentElement.appendChild(newTaskEl);
      });
    }
    addTaskInput(tasksContainer, onCallback) {
      let newTaskEl = document.createElement("input");
      newTaskEl.placeholder = "Add task...", newTaskEl.classList.add("task-input"), tasksContainer.prepend(newTaskEl), newTaskEl.addEventListener("change", () => {
        onCallback && onCallback(newTaskEl.value), newTaskEl.value = "";
      });
    }
  };
  new TimeSectionView(VIEW_TYPE);
  function getAdjustedDate(date, sectionType, sectionOffset) {
    let timeOffset = parseInt(sectionOffset), sectionDate = new Date(date);
    if (!isNaN(timeOffset) && timeOffset != 0) {
      let sectionOffsetFn = TimeSectionOffset[sectionType];
      if (typeof sectionOffsetFn != "function") throw Error("Unknown time section: " + sectionType);
      sectionOffsetFn(sectionDate, timeOffset);
    }
    return sectionDate;
  }
  return plugin;
})()
<\/script>\r
</body>\r
</html>`;

  // common-utils/embed-comunication.js
  function createOnEmbedCallHandler(embedCommands = {}) {
    return async function(app, commandName, ...args) {
      console.log("onEmbedCall", commandName, args);
      try {
        if (commandName in embedCommands)
          return await embedCommands[commandName](app, ...args);
      } catch (e) {
        throw app.alert("Error:", e.message || e), console.error(e), e;
      }
      throw new Error(`Unknown command: ${commandName}`);
    };
  }

  // common-utils/embed-helpers.js
  var addScriptToHtmlString = (htmlString, scriptContent) => {
    let doc = new DOMParser().parseFromString(htmlString, "text/html"), script = doc.createElement("script");
    script.textContent = scriptContent;
    let head = doc.head;
    return head.firstChild ? head.insertBefore(script, head.firstChild) : head.appendChild(script), doc.documentElement.outerHTML.replaceAll("\\x3Cscript>", () => "<script>");
  }, addWindowVariableToHtmlString = (htmlString, variableName, variableValue) => {
    let scriptContent = `window.${variableName} = ${JSON.stringify(variableValue)};`;
    return addScriptToHtmlString(htmlString, scriptContent);
  };
  var appConnector = new Proxy({}, {
    get: function(target, prop, receiver) {
      return prop in target ? target[prop] : async function(...args) {
        return await window.callAmplenotePlugin(prop, ...args);
      };
    }
  });

  // src-longterm/plugin.js
  var plugin = {
    appOption: {
      "Update Settings": async function(app) {
        let newSettings = await app.prompt("Update Settings:", {
          inputs: [
            { label: "Show completed tasks", type: "select", options: [
              { label: "Yes", value: "true" },
              { label: "No", value: "false" }
            ], value: app.settings[SHOW_COMPLETED_TASKS_SETTING] || SHOW_COMPLETED_TASKS_SETTING_DEFAULT || "true" },
            { label: "Start of week", type: "select", options: [
              { label: "Monday", value: "1" },
              { label: "Sunday", value: "0" }
            ], value: app.settings[START_OF_WEEK_SETTING] || START_OF_WEEK_SETTING_DEFAULT || "0" },
            {
              label: "Filter tags",
              type: "tags",
              limit: 3
            }
          ]
        });
        if (!newSettings) return;
        let [showCompletedTasks, startOfWeek, filterTags] = newSettings;
        await app.setSetting(SHOW_COMPLETED_TASKS_SETTING, showCompletedTasks), await app.setSetting(START_OF_WEEK_SETTING, startOfWeek), await app.setSetting(FILTER_TAGS_SETTING, filterTags || "");
      },
      "Open Horizon View": async function(app) {
        app.openSidebarEmbed(2, "horizon", "sidebar");
      }
    },
    insertText: {
      "Horizon view": createExperssionForView("horizon"),
      "Years view": createExperssionForView("years"),
      "Months view": createExperssionForView("months"),
      "Weeks view": createExperssionForView("weeks"),
      "Days view": createExperssionForView("days")
    },
    renderEmbed(app, args, source = "embed") {
      return addWindowVariableToHtmlString(longterm_note_default, "ViewData", {
        VIEW_TYPE: args,
        START_OF_WEEK: parseInt(app.settings[START_OF_WEEK_SETTING] || START_OF_WEEK_SETTING_DEFAULT) || 0
      });
    },
    onEmbedCall: createOnEmbedCallHandler({
      getNoteTasks: async (app, noteName) => {
        let note = await plugin._findNote(app, noteName);
        if (!note) return null;
        let includeDone = (app.settings[SHOW_COMPLETED_TASKS_SETTING] || SHOW_COMPLETED_TASKS_SETTING_DEFAULT) === "true";
        return await app.getNoteTasks(note, { includeDone });
      },
      addNoteTask: async (app, noteName, taskText) => {
        let note = await plugin._findNote(app, noteName, !0);
        if (!note) return null;
        let taskUUID = null;
        try {
          taskUUID = await app.insertTask(note, { content: taskText });
        } catch {
          return null;
        }
        return await app.getTask(taskUUID);
      },
      moveNoteTask: async (app, noteName, taskUUID) => {
        let note = await plugin._findNote(app, noteName, !0);
        return note ? await app.updateTask(taskUUID, { noteUUID: note.uuid }) : null;
      },
      toggleTask: async (app, taskUUID, checked) => {
        let completedAt = null;
        return checked && (completedAt = Math.floor(Date.now() / 1e3)), await app.updateTask(taskUUID, { completedAt });
      }
    }),
    async _findNote(app, noteName, canCreate = !1) {
      let tagsList = (app.settings[FILTER_TAGS_SETTING] || FILTER_TAGS_SETTING_DEFAULT).split(",").filter((x) => x), note = await app.findNote({ name: noteName, tags: tagsList });
      return note || (canCreate ? (/\w{3,} \d{1,2}(st|nd|rd|th), \d{4}/.test(noteName) && tagsList.push("daily-jots"), { uuid: await app.createNote(noteName, tagsList) }) : null);
    }
  }, plugin_default = plugin;
  function createExperssionForView(viewType) {
    return {
      check() {
        return viewType;
      },
      run: async function(app) {
        if (await app.context.replaceSelection(
          `<object data="plugin://${app.context.pluginUUID}?${viewType}" data-aspect-ratio="2" />`
        )) return null;
      }
    };
  }
  return plugin;
})()
//# sourceMappingURL=plugin.js.map
