/***
 * Source Code: https://github.com/AmeerDotEXE/my-amplenote-plugins
 * Author: AmeerDotEXE
 * Build: production
 * Target Folder: src-crm
 ***/
(() => {
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

  // src-crm/constants.js
  var PERSON_TAG_SETTING_DEFAULT = "person", START_OF_WEEK_SETTING_DEFAULT = "0", PERSON_TAG_SETTING = `People's Tag (default: ${PERSON_TAG_SETTING_DEFAULT})`, START_OF_WEEK_SETTING = `Start Of Week (default: ${START_OF_WEEK_SETTING_DEFAULT})`;

  // src-crm/lib/markdown.js
  function _sectionFromHeadingText(headingText, { level = 1 } = {}) {
    return { heading: { text: headingText, level } };
  }
  function _markdownFromTableRow(headers, item) {
    let row;
    try {
      row = headers.map((header) => {
        let cellContents = "";
        return cellContents = item[header].replace(/(?<!!\[.*\\)\|/g, ","), cellContents = cellContents.replace(/\n/gm, " "), cellContents;
      });
    } catch (err) {
      if (err.name === "TypeError")
        throw new Error(`${err.message} (line 836)`);
    }
    return `| ${row.join(" | ")} |
`;
  }
  function _objectTableFromMarkdown(content) {
    console.debug(`_objectTableFromMarkdown(${content})`);
    let tableRegex = /^\s*\|(\s*[^|]+\s*\|)+$\n(\s*\|(.*\|)+$)+/gm, tableMatch = content.match(tableRegex);
    if (!tableMatch)
      throw console.error("No table detected in the content"), new Error("No table detected in the content");
    let lines = tableMatch[0].split(`
`);
    if (lines.length < 2) return null;
    if (lines = lines.filter((row) => row.trim() !== "" && !row.trim().match(/^\s*\|([-\s]+\|\s*)+$/)), !lines[0])
      throw console.error(`content has no meaningful rows: ${lines.join(`
`)}`), new Error(`content has no meaningful rows: ${lines.join(`
`)}`);
    let table = lines.map((row) => row.split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.trim().split("<!--")[0]));
    return Object.fromEntries(table);
  }

  // src-crm/lib/amplenote_rw.js
  function _sectionContent(noteContent, headingTextOrSectionObject) {
    console.debug("_sectionContent()");
    let sectionHeadingText;
    typeof headingTextOrSectionObject == "string" ? sectionHeadingText = headingTextOrSectionObject : sectionHeadingText = headingTextOrSectionObject.heading.text;
    try {
      sectionHeadingText = sectionHeadingText.replace(/^#+\s*/, "");
    } catch (err) {
      if (err.name === "TypeError")
        throw new Error(`${err.message} (line 1054)`);
    }
    let { startIndex, endIndex } = _sectionRange(noteContent, sectionHeadingText);
    return noteContent.slice(startIndex, endIndex);
  }
  function _sectionRange(bodyContent, sectionHeadingText) {
    console.debug("_sectionRange");
    let sectionRegex = /^#+\s*([^#\n\r]+)/gm, indexes = Array.from(bodyContent.matchAll(sectionRegex)), sectionMatch = indexes.find((m) => m[1].trim() === sectionHeadingText.trim());
    if (sectionMatch) {
      let level = sectionMatch[0].match(/^#+/)[0].length, nextMatch = indexes.find((m) => m.index > sectionMatch.index && m[0].match(/^#+/)[0].length <= level), endIndex = nextMatch ? nextMatch.index : bodyContent.length;
      return { startIndex: sectionMatch.index + sectionMatch[0].length + 1, endIndex };
    } else
      return console.error("Could not find section", sectionHeadingText, "that was looked up. This might be expected"), { startIndex: null, endIndex: null };
  }
  async function _noteContent(noteContents, note) {
    return typeof noteContents[note.uuid] == "undefined" && (noteContents[note.uuid] = await note.content()), noteContents[note.uuid];
  }

  // inline-html:src-crm/embed/dashboard.html
  var dashboard_default = `<!DOCTYPE html>\r
<html lang="en">\r
<head>\r
	<meta charset="UTF-8">\r
	<meta name="viewport" content="width=device-width, initial-scale=1.0">\r
	\r
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">\r
	<style>/* src-crm/embed/widget.css */
:root {
  --editor-background: #192025;
  --secondary-menu-background: #272F35;
  --secondary-menu-outline: #273740;
  --primary-menu-background: #2C3B47;
  --button-action-background: #3E92CC;
  --text-primary-color: #FFFFFF;
  --text-secondary-color: #BFBFBF;
}
html,
body {
  height: 100%;
}
body {
  background-color: var(--editor-background);
  color: var(--text-primary-color);
  font-family:
    Arial Narrow,
    Arial,
    sans-serif;
  margin: 0;
  font-size: 1.2vw;
}
.main-content {
  height: 100%;
  display: flex;
  padding: 3vw;
  gap: 2vw;
  box-sizing: border-box;
}
.widget {
  width: fit-content;
  display: flex;
  flex-direction: column;
  padding: 1.2vw;
  gap: 1.2vw;
}
.widget.menu {
  flex-grow: 1;
  width: 1px;
  background-color: var(--secondary-menu-background);
  border: 1px solid var(--secondary-menu-outline);
  border-radius: .8vw;
  padding: .6vw;
}
.widget .section {
  background-color: var(--editor-background);
  border-radius: .6vw;
}
.stats {
  min-height: 12vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.stats .stat {
  font-weight: 700;
  font-size: 3vw;
}
.stats .stat-label {
  margin-top: 1vw;
  font-size: 1.5vw;
}
.stats-duration {
  color: var(--text-secondary-color);
  font-size: 1.4vw;
  text-align: center;
}
.add-menu {
  margin-top: auto;
  height: 100%;
  max-height: 25vw;
  display: flex;
  flex-direction: column;
  padding: .6vw;
  gap: .6vw;
}
.add-menu-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.add-menu .search-input .selected-user {
  padding: .4vw .8vw;
  margin: .4vw .5vw;
  margin-right: auto;
  border-radius: .8vw;
  border: .1vw solid;
  font-size: 1.5vw;
}
.add-menu .divider {
  margin: 0 1.2vw;
}
.add-menu .search-input textarea {
  height: 100%;
  width: 100%;
  padding: .8vw 1vw;
  box-sizing: border-box;
  font-size: 1.5vw;
  background: transparent;
  border: 0px;
  color: var(--text-primary-color);
  font-family:
    Arial Narrow,
    Arial,
    sans-serif;
  outline: 0px;
  resize: none;
}
.add-menu .add-menu-type:not(.active) {
  display: none;
}
.add-menu-type-title {
  color: var(--text-primary-color);
  font-size: 1.4vw;
  padding: .8vw 1vw 0;
}
.add-menu-type-options {
  display: flex;
  gap: .4vw;
  padding: .6vw 1vw;
  box-sizing: border-box;
  width: 100%;
  overflow: auto;
  scrollbar-color: var(--text-secondary-color) transparent;
}
.add-menu-type-options.custom {
  padding: 0;
}
.add-menu-type-option {
  flex-shrink: 0;
  border-radius: .8vw;
  border: .1vw solid;
  color: var(--text-secondary-color);
  padding: .2vw .4vw;
  font-size: 1.5vw;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.add-menu-type-option i {
  font-size: 1.5vw;
}
.add-menu-type-option:hover {
  color: var(--text-primary-color);
}
.add-menu-type-option.active {
  background-color: var(--text-secondary-color);
  border-color: var(--text-secondary-color);
  color: var(--primary-menu-background);
}
.add-menu-type-custom {
  width: 100%;
}
.add-menu-type-options:not(.custom) .add-menu-type-custom,
.add-menu-type-options.custom .add-menu-type-option {
  display: none;
}
.add-menu-buttons {
  display: flex;
  justify-content: space-between;
}
.grouped-options {
  border: .1vw solid var(--button-action-background);
  border-radius: .4vw;
  display: flex;
  overflow: hidden;
}
.grouped-option {
  padding: .72vw .96vw;
  cursor: pointer;
  font-size: 1.5vw;
}
.grouped-option:hover {
  background-color: var(--primary-menu-background);
}
.grouped-option.active {
  background-color: var(--button-action-background);
}
.add-menu-buttons button.action-button {
  background-color: var(--button-action-background);
  color: var(--text-primary-color);
  border-radius: .4vw;
  border: 0;
  padding: .6vw 1.2vw;
  font-size: 1.5vw;
  cursor: pointer;
}
.tabs {
  display: flex;
  gap: 1.2vw;
  width: max-content;
}
.tab-btn {
  font-size: 1.5vw;
  padding: .6vw 1.2vw;
  border-radius: .8vw;
  cursor: pointer;
}
.tab-btn:hover {
  background-color: var(--secondary-menu-background);
}
.tab-btn.active {
  background-color: var(--primary-menu-background);
}
.widget .divider {
  height: .1vw;
  background-color: var(--secondary-menu-outline);
}
.search-input {
  display: flex;
  align-items: center;
}
.search-input input {
  color: var(--text-primary-color);
  background: transparent;
  width: 100%;
  appearance: none;
  border: 0;
  outline: 0;
  font-size: 1.5vw;
  padding: .8vw 0 .8vw 1vw;
}
.search-input input[type=date] {
  color: #000;
  filter: invert(1);
}
.search-input i {
  padding: .3vw;
  margin: .3vw;
  border-radius: .4vw;
  font-size: 2vw;
  cursor: pointer;
}
.search-input i:hover {
  background: var(--secondary-menu-background);
}
.search-input:not(.custom) > .custom,
.search-input.custom > *:not(.custom) {
  display: none;
}
.people-list {
  overflow: auto;
  scrollbar-color: var(--primary-menu-background) transparent;
}
.person {
  display: flex;
  padding: 1.2vw;
  gap: 1.2vw;
  align-items: center;
}
.person .avatar {
  background-color: var(--primary-menu-background);
  width: 5.4vw;
  height: 5.4vw;
  border-radius: 50%;
}
.person .person-info {
  flex-grow: 1;
}
.person .person-name {
  font-weight: 600;
  font-size: 1.5vw;
}
.person .person-details {
  color: var(--button-action-background);
  font-size: 1.4vw;
  display: flex;
  align-items: center;
  gap: .24vw;
}
.person .last-interaction {
  color: var(--text-secondary-color);
  font-size: 1.4vw;
  display: flex;
  align-items: center;
  gap: .24vw;
}
.person .person-details i,
.person .last-interaction i {
  font-size: 1.2vw;
}
.person .person-options {
  font-size: 1.6vw;
  border-radius: 50%;
  padding: .4vw;
  cursor: pointer;
}
.person .person-options:hover {
  background-color: var(--primary-menu-background);
}
.context-menu {
  position: fixed;
  background-color: var(--editor-background);
  border: .1vw solid var(--secondary-menu-outline);
  border-radius: .8vw;
  padding: .2vw;
  gap: .3vw;
  min-width: 8vw;
  display: flex;
  flex-direction: column;
}
.context-menu button {
  border-radius: .6vw;
  padding: .4vw .6vw;
  font-size: 1.4vw;
  border: 0;
  background-color: transparent;
  color: var(--text-primary-color);
  cursor: pointer;
}
.context-menu button:hover {
  background-color: var(--primary-menu-background);
}
</style>\r
</head>\r
<body>\r
	<div class="main-content">\r
		<div class="widget menu">\r
			<div class="section stats">\r
				<div class="stat" id="reminders-stats">1 / 6</div>\r
				<div class="stat-label">reminders done</div>\r
			</div>\r
			<div class="stats-duration">\r
				2 days left until end of week\r
			</div>\r
\r
			<div class="section add-menu">\r
				<div class="add-menu-content">\r
					<div class="section search-input">\r
						<input type="text" id="add-who" placeholder="Who">\r
						<!-- auto complete user -->\r
						<div class="selected-user custom" id="add-who-selected">Person Name</div>\r
						<i class="material-icons custom" id="add-who-unselect">close</i>\r
					</div>\r
					<div class="divider"></div>\r
					<div class="section search-input" style="flex-grow: 1;">\r
						<textarea id="add-note" placeholder="Your note"></textarea>\r
					</div>\r
				</div>\r
\r
				<div class="add-menu-type" data-type="interaction">\r
					<div class="divider"></div>\r
					<div class="add-menu-type-title">How did you catch up?</div>\r
					<div class="add-menu-type-options">\r
						<div class="add-menu-type-option">Call</div>\r
						<div class="add-menu-type-option">Text</div>\r
						<div class="add-menu-type-option">Email</div>\r
						<div class="add-menu-type-option">Met in person</div>\r
						<div class="add-menu-type-option">\r
							<i class="material-icons">more_horiz</i>\r
						</div>\r
						<div class="add-menu-type-custom">\r
							<div class="section search-input">\r
								<input type="text" placeholder="...">\r
								<i class="material-icons">close</i>\r
							</div>\r
						</div>\r
					</div>\r
				</div>\r
				<div class="add-menu-type" data-type="reminder">\r
					<div class="divider"></div>\r
					<div class="add-menu-type-title">Set reminder?</div>\r
					<div class="add-menu-type-options">\r
						<div class="add-menu-type-option">Today</div>\r
						<div class="add-menu-type-option">Tomorrow</div>\r
						<div class="add-menu-type-option">Next week</div>\r
						<div class="add-menu-type-option">Next month</div>\r
						<div class="add-menu-type-option">\r
							<i class="material-icons">more_horiz</i>\r
						</div>\r
						<div class="add-menu-type-custom">\r
							<div class="section search-input">\r
								<input type="date">\r
								<i class="material-icons">close</i>\r
							</div>\r
						</div>\r
					</div>\r
				</div>\r
\r
				<div class="add-menu-buttons">\r
					<div class="grouped-options">\r
						<i class="material-icons grouped-option active" data-type="note">description</i>\r
						<i class="material-icons grouped-option" data-type="interaction">chat_bubble</i>\r
						<i class="material-icons grouped-option" data-type="reminder">calendar_today</i>\r
					</div>\r
\r
					<button class="action-button" id="add-menu-button">Add</button>\r
				</div>\r
			</div>\r
		</div>\r
		<div class="widget">\r
			<div class="tabs" id="reminder-tabs">\r
				<div class="tab-btn">Missed</div>\r
				<div class="tab-btn active">This week</div>\r
				<div class="tab-btn">Upcoming</div>\r
			</div>\r
			<div class="divider"></div>\r
			<div class="people-list" id="reminders"></div>\r
		</div>\r
		<div class="widget menu">\r
			<div class="section search-input">\r
				<input type="text" id="search-relationships" placeholder="Search Relationships...">\r
				<i class="material-icons" id="search-rs-filter">filter_alt</i>\r
			</div>\r
			<div class="people-list" id="relationships"></div>\r
		</div>\r
	</div>\r
	\r
	<script>(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: !0, configurable: !0, writable: !0, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key != "symbol" ? key + "" : key, value);

  // src-crm/test/embed/dashboard.testdata.js
  var EMBED_COMMANDS_MOCK = {
    getAllPeopleNotes: async () => [
      {
        avatar: null,
        reminders: [
          {
            text: "watch movie",
            startAt: Math.floor(Date.now() / 1e3) + 691200,
            uuid: "22222222-aaaa-4444-9999-11111111111"
          },
          {
            text: "watch movie d",
            uuid: "ffffffff-2222-4444-9999-999999999999"
          },
          {
            text: "send him the plugin",
            startAt: Math.floor(Date.now() / 1e3) - 7200,
            uuid: "aaaaaaaa-5555-4444-aaaa-aaaaaaaaaaaa"
          }
        ],
        activities: [
          {
            type: "note",
            date: Date.now(),
            note: "nothing"
          },
          {
            type: "interaction",
            date: Date.now(),
            note: "nothing",
            method: "met in person"
          },
          {
            type: "note",
            date: Date.now(),
            note: \`ease\\\\
yay new line\`
          },
          {
            type: "note",
            date: Date.now() - 864e5,
            // yesterday
            note: \`note

    - sub note\`
          }
        ],
        autoRemind: "every month",
        remindWeek: Date.now() + 6048e5,
        generalNote: "nothing",
        familyInfo: "",
        name: "Bill",
        tags: ["person/ceo"],
        uuid: "55555555-2222-1111-9999-888888888888"
      },
      {
        avatar: "https://cdn.discordapp.com/avatars/683272246151610389/43404fabac58b00de4cfa85dd8cb7bee.webp",
        reminders: [],
        activities: [
          {
            type: "note",
            date: Date.now(),
            note: "chatted"
          },
          {
            type: "interaction",
            date: Date.now() - 864e5,
            // yesterday
            note: "nothing",
            method: "discord"
          }
        ],
        autoRemind: "every week",
        remindWeek: Date.now(),
        generalNote: "nothing",
        familyInfo: "",
        name: "Mat",
        tags: ["person/friends"],
        uuid: "55555555-2222-1111-4444-888888888888"
      },
      {
        avatar: "https://cdn.discordapp.com/avatars/490593057281015860/429387cbb258aa0691045c4cc3c086b4.webp",
        reminders: [
          {
            text: "send plugin",
            startAt: Math.floor(Date.now() / 1e3) - 432e3,
            uuid: "22222222-aaaa-4444-5555-11111111111"
          }
        ],
        activities: [],
        autoRemind: "every 2 weeks",
        remindWeek: Date.now() - 6048e5,
        generalNote: "nothing",
        familyInfo: "",
        name: "Lucian",
        tags: ["person/friends", "person/ceo"],
        uuid: "55555555-2222-1111-5555-888888888888"
      }
    ],
    addActivity: (newActivity) => new Promise((res) => setTimeout(res, 1e3, !0)),
    addReminder: (newActivity) => new Promise((res) => setTimeout(res, 1e3, [{
      text: newActivity.note,
      startAt: Math.floor(Date.now() / 1e3) + 604800,
      uuid: "22222222-bbbb-4444-9999-11111111111"
    }])),
    removeReminder: (noteUUID, taskUUID) => new Promise((res) => setTimeout(res, 1e3, [])),
    completeReminder: (noteUUID, taskUUID) => new Promise((res) => setTimeout(res, 1e3, [])),
    navigateToNote: (noteUUID) => new Promise((res) => setTimeout(res, 1e3, !0)),
    getNoteRelationship: async (noteUUID) => await EMBED_COMMANDS_MOCK.getRelationship(noteUUID),
    getRelationship: async (noteUUID) => await EMBED_COMMANDS_MOCK.getAllPeopleNotes().then((x) => x == null ? void 0 : x[0])
  }, DASHBOARD_DATA_MOCK = {
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

  // src-crm/embed/RightClickMenu.js
  var RightClickMenu = class {
    /**
     * creates a context menu for element
     * @param {HTMLElement} element 
     */
    constructor(element, options) {
      /** @type {HTMLElement?} */
      __publicField(this, "currentMenu", null);
      /**
       * @type {(
       * MenuButton
       * )[]}
       */
      __publicField(this, "menuItems", []);
      __publicField(this, "options", {
        allowClicking: !1,
        leftSided: !1
      });
      /** @private */
      __publicField(this, "_openMenuEvent", (event) => {
        event.preventDefault(), this.openMenu(event.clientX, event.clientY);
      });
      /** @private */
      __publicField(this, "_closeMenuEvent", (event) => this.closeMenu());
      /** @private */
      __publicField(this, "_MenuItemsFn", {
        button: this._createButton
      });
      this.options = {
        ...this.options,
        ...options
      }, element != null && (element.addEventListener("contextmenu", this._openMenuEvent), this.options.allowClicking && element.addEventListener("click", this._openMenuEvent));
    }
    openMenu(x = 0, y = 0) {
      this.currentMenu && this.closeMenu();
      let contextMenuEl = document.createElement("div");
      contextMenuEl.classList.add("context-menu"), contextMenuEl.style.top = y + "px", this.options.leftSided ? contextMenuEl.style.right = window.innerWidth - x + "px" : contextMenuEl.style.left = x + "px", this._populateMenu(contextMenuEl), this.currentMenu = contextMenuEl, document.body.appendChild(contextMenuEl), requestAnimationFrame(() => {
        document.addEventListener("click", this._closeMenuEvent), document.addEventListener("contextmenu", this._closeMenuEvent);
      });
    }
    closeMenu() {
      this.currentMenu && (document.removeEventListener("click", this._closeMenuEvent), document.removeEventListener("contextmenu", this._closeMenuEvent), this.currentMenu.remove());
    }
    /** @private */
    _populateMenu(menuEl) {
      this.menuItems.forEach((menuItem) => {
        menuEl.appendChild(this._MenuItemsFn[menuItem.type](menuItem));
      });
    }
    /**
     * @private
     * @param {MenuButton} menuItem
     * */
    _createButton(menuItem) {
      let buttonEl = document.createElement("button");
      return buttonEl.textContent = menuItem.text, buttonEl.addEventListener("click", menuItem.onCallback), buttonEl;
    }
    /**
     * @typedef {{
     * type: "button";
     * text: string;
     * onCallback: function?;
     * }} MenuButton
     */
    addButton(text, onCallback, {} = {}) {
      return this.menuItems.push({
        type: "button",
        text,
        onCallback
      }), this;
    }
  };

  // src-crm/embed/dashboard.js
  setupPluginCallMock(EMBED_COMMANDS_MOCK);
  window.DashboardData = window.DashboardData || DASHBOARD_DATA_MOCK;
  window.START_OF_DAY_OFFSET = DashboardData.START_OF_WEEK || 0;
  var relationships = [];
  initilizeWidget();
  async function initilizeWidget() {
    relationships = await appConnector.getAllPeopleNotes(), console.debug("recieved", relationships.length, "relationships"), loadStats(), initilizeAddMenu(), loadReminders(), loadRelationships();
  }
  function loadStats() {
    let reminderStatsEl = document.querySelector("#reminders-stats"), statsDurationEl = document.querySelector(".stats-duration"), remindersWaiting = relationships.filter(
      (relationship) => relationship.remindWeek && withinThisWeek(relationship.remindWeek) === 0
    ).length, interactionsToday = relationships.filter(
      (relationship) => {
        var _a;
        return (_a = relationship.activities) == null ? void 0 : _a.some(
          (activity) => activity.type == "interaction" && withinThisWeek(new Date(activity.date)) === 0
        );
      }
    ).length;
    reminderStatsEl.textContent = \`\${interactionsToday} / \${interactionsToday + remindersWaiting}\`;
    let daysToNextWeek = (7 - (/* @__PURE__ */ new Date()).getDay() + START_OF_DAY_OFFSET) % 7 || 7;
    statsDurationEl.textContent = \`\${daysToNextWeek} day\${daysToNextWeek == 1 ? "" : "s"} left until end of week\`;
  }
  function initilizeAddMenu() {
    let whoField = document.querySelector("#add-who"), whoSelectedField = document.querySelector("#add-who-selected"), whoUnselectBtn = document.querySelector("#add-who-unselect"), noteField = document.querySelector("#add-note"), typesBtn = document.querySelectorAll(".add-menu-buttons .grouped-option"), addBtn = document.querySelector("#add-menu-button"), selectedType = "note", selectedRelationship = null, typesValue = {};
    whoField.addEventListener("input", () => {
      let result = relationships.filter(
        (relationship) => relationship.name.toLowerCase().includes(whoField.value.toLowerCase())
      );
      result.length > 1 || result.length < 1 || (selectedRelationship = result[0], whoSelectedField.textContent = selectedRelationship.name, whoField.parentElement.classList.add("custom"), whoField.value = "");
    }), whoUnselectBtn.addEventListener("click", () => {
      selectedRelationship = null, whoField.parentElement.classList.remove("custom");
    }), document.querySelectorAll(".add-menu-type").forEach((typeMenuEl) => {
      let currentType = typeMenuEl.dataset.type, optionsEl = typeMenuEl.querySelector(".add-menu-type-options");
      if (!optionsEl) return;
      let openCustomBtn = optionsEl.querySelector(".add-menu-type-option i");
      if (!openCustomBtn) return;
      openCustomBtn = openCustomBtn.parentElement;
      let customOptionEl = optionsEl.querySelector(".add-menu-type-custom"), customOptionInput = optionsEl.querySelector(".add-menu-type-custom input"), closeCustomBtn = optionsEl.querySelector(".add-menu-type-custom i");
      openCustomBtn.addEventListener("click", () => {
        optionsEl.classList.add("custom"), typesValue[currentType] = null, Array.from(optionsEl.children).filter((optionEl) => optionEl != openCustomBtn && optionEl != customOptionEl).forEach((optionEl) => optionEl.classList.remove("active"));
      }), closeCustomBtn.addEventListener("click", () => {
        optionsEl.classList.remove("custom"), typesValue[currentType] = null;
      }), customOptionInput.addEventListener("input", () => {
        typesValue[currentType] = customOptionInput.value;
      }), Array.from(optionsEl.children).filter((optionEl) => optionEl != openCustomBtn && optionEl != customOptionEl).forEach((optionEl) => {
        optionEl.addEventListener("click", () => {
          typesValue[currentType] = optionEl.textContent, Array.from(optionsEl.children).filter((optionEl2) => optionEl2 != openCustomBtn && optionEl2 != customOptionEl).forEach((optionEl2) => optionEl2.classList.remove("active")), optionEl.classList.add("active");
        });
      });
    }), typesBtn.forEach((typeBtn, btnIndex) => {
      typeBtn.addEventListener("click", () => {
        selectedType = typeBtn.dataset.type, document.querySelectorAll(".add-menu-type[data-type]").forEach(
          (x) => x.classList.toggle("active", x.dataset.type == typeBtn.dataset.type)
        ), typesBtn.forEach((x) => x.classList.remove("active")), typeBtn.classList.add("active");
      });
    });
    let addingDisabled = !1, AutoRemindOffsets = {
      week: () => Date.now() + AutoRemindOffsets._dayOffset * 7,
      weeks: (num) => Date.now() + AutoRemindOffsets._dayOffset * 7 * num,
      month: () => Date.now() + AutoRemindOffsets._dayOffset * 30,
      months: (num) => Date.now() + AutoRemindOffsets._dayOffset * 30 * num,
      year: () => Date.now() + AutoRemindOffsets._dayOffset * 365,
      years: (num) => Date.now() + AutoRemindOffsets._dayOffset * 365 * num,
      _dayOffset: 1e3 * 60 * 60 * 24
    };
    addBtn.addEventListener("click", async () => {
      var _a;
      if (addingDisabled || selectedRelationship == null) return;
      let newActivity = {
        type: selectedType,
        relationship: selectedRelationship,
        date: Date.now(),
        note: noteField.value || "empty"
      };
      switch (selectedType) {
        case "interaction":
          newActivity.method = typesValue.interaction || "Text";
          break;
        case "reminder":
          newActivity.date = typesValue.reminder || "Today";
          break;
      }
      switch (whoUnselectBtn.click(), noteField.value = "", addingDisabled = !0, addBtn.style.opacity = "0.4", console.debug("sending relationship activity", newActivity), newActivity.type) {
        case "note":
          await appConnector.addActivity(newActivity), newActivity.relationship.activities.unshift({
            type: "note",
            date: Date.now(),
            note: newActivity.note
          });
          break;
        case "interaction":
          if (await appConnector.addActivity(newActivity), newActivity.relationship.activities.unshift({
            type: "interaction",
            date: Date.now(),
            note: newActivity.note,
            method: newActivity.method
          }), (_a = newActivity.relationship.autoRemind) != null && _a.toLowerCase().startsWith("every ")) {
            let remindType = newActivity.relationship.autoRemind.trim().split(" ").at(-1), remindOffset = parseInt(newActivity.relationship.autoRemind.trim().split(" ").at(-2));
            newActivity.relationship.remindWeek = AutoRemindOffsets[remindType](remindOffset);
          }
          break;
        case "reminder":
          newActivity.relationship.reminders = await appConnector.addReminder(newActivity);
          break;
      }
      addingDisabled = !1, addBtn.style.opacity = "1", loadStats(), updateRelationshipList(relationships), updateReminderList(relationships);
    });
  }
  function loadReminders() {
    let reminderTabsEl = document.querySelectorAll("#reminder-tabs .tab-btn"), remindersEl = document.querySelector("#reminders"), selectedFilter = 0;
    updateList(relationships), window.updateReminderList = updateList, reminderTabsEl.forEach((reminderTab, tabIndex) => {
      reminderTab.addEventListener("click", () => {
        selectedFilter = tabIndex - 1, reminderTabsEl.forEach((x) => x.classList.remove("active")), reminderTab.classList.add("active"), updateList(relationships);
      });
    });
    function updateList(relationships2) {
      Array.from(remindersEl.children).forEach((x) => x.remove()), relationships2.filter(
        (relationship) => relationship.remindWeek && withinThisWeek(relationship.remindWeek) === selectedFilter
      ).forEach((relationship) => {
        remindersEl.appendChild(
          createPersonEl(
            relationship,
            createPersonDetails({
              type: "date",
              weekDay: relationship.remindWeek
            }),
            {
              hideOptions: !0
            }
          )
        );
      }), relationships2.forEach((relationship) => {
        relationship.reminders.filter(
          (reminder) => reminder.completedAt == null && reminder.startAt != null && withinThisWeek(reminder.startAt * 1e3) === selectedFilter
        ).forEach((reminder) => {
          remindersEl.appendChild(
            createPersonEl(
              relationship,
              createPersonDetails({
                type: "time",
                text: dateToRelativeText(reminder.startAt * 1e3, {
                  includeTime: !0
                })
              }),
              {
                hideOptions: reminder.uuid == null,
                interactionText: reminder.text.slice(0, 40),
                /** @param {RightClickMenu} contextMenu */
                createOptions: (contextMenu) => {
                  contextMenu.addButton("Check Reminder", async () => {
                    relationship.reminders = await appConnector.completeReminder(relationship.uuid, reminder.uuid), updateList(relationships2);
                  }), contextMenu.addButton("Delete Reminder", async () => {
                    relationship.reminders = await appConnector.removeReminder(relationship.uuid, reminder.uuid), updateList(relationships2);
                  });
                }
              }
            )
          );
        });
      });
    }
  }
  function loadRelationships() {
    let relationshipsSearchEl = document.querySelector("#search-relationships"), relationshipsFilterBtn = document.querySelector("#search-rs-filter"), relationshipsEl = document.querySelector("#relationships"), selectedFrequency = null, selectedTag = null;
    updateList(relationships), window.updateRelationshipList = updateList, relationshipsSearchEl.addEventListener("input", () => {
      updateList(relationships);
    }), new RightClickMenu(relationshipsFilterBtn, {
      allowClicking: !0,
      leftSided: !0
    }).addButton("All", () => {
      selectedFrequency = null, selectedTag = null, updateList(relationships);
    }).addButton("Frequencies", (event) => {
      let frequenciesMenu = new RightClickMenu(null, {
        leftSided: !0
      });
      Object.keys(relationships.map((x) => x.autoRemind).reduce((a, c) => (c = c.toLowerCase(), a[c] = (a[c] || 0) + 1, a), {})).forEach((frequency) => frequenciesMenu.addButton(frequency, () => {
        selectedFrequency = frequency, updateList(relationships);
      })), frequenciesMenu.openMenu(event.clientX, event.clientY);
    }).addButton("Tags", (event) => {
      let tagsMenu = new RightClickMenu(null, {
        leftSided: !0
      });
      Object.keys(relationships.map((x) => x.tags).reduce((a, c) => {
        c = c || [];
        for (let x of c) {
          let y = x.split("/").slice(1).join("/");
          y && (a[y] = (a[y] || 0) + 1);
        }
        return a;
      }, {})).forEach((tag) => tagsMenu.addButton(tag, () => {
        selectedTag = tag, updateList(relationships);
      })), tagsMenu.openMenu(event.clientX, event.clientY);
    });
    function updateList(relationships2) {
      Array.from(relationshipsEl.children).forEach((x) => x.remove()), relationships2.filter(
        (relationship) => selectedTag == null || relationship.tags.some(
          (tag) => tag.split("/").slice(1).join("/") == selectedTag
        )
      ).filter(
        (relationship) => selectedFrequency == null || relationship.autoRemind.toLowerCase() == selectedFrequency
      ).filter(
        (relationship) => relationship.name.toLowerCase().includes(relationshipsSearchEl.value.toLowerCase())
      ).forEach((relationship) => {
        relationshipsEl.appendChild(
          createPersonEl(
            relationship,
            createPersonDetails({
              type: "frequency",
              text: relationship.autoRemind
            }),
            {
              hideOptions: relationship.uuid == null,
              /** @param {RightClickMenu} contextMenu */
              createOptions: (contextMenu) => {
                contextMenu.options.leftSided = !0, contextMenu.addButton("Open Note", async () => {
                  await appConnector.navigateToNote(relationship.uuid);
                }), contextMenu.addButton("Update Relationship", async () => {
                  let index = relationships2.findIndex((x) => x.uuid == relationship.uuid);
                  if (index == -1) throw Error("relationship isn't in list");
                  relationships2[index] = await appConnector.getNoteRelationship(relationship.uuid), loadStats(), updateRelationshipList(relationships2), updateReminderList(relationships2);
                });
              }
            }
          )
        );
      });
    }
  }
  function createPersonEl(personData, detailsEl, options = {}) {
    var _a, _b;
    let personEl = document.createElement("div"), avatarEl = document.createElement(personData.avatar ? "img" : "div"), personInfoEl = document.createElement("div"), personNameEl = document.createElement("div"), lastInteractionEl = document.createElement("div"), lastInteractionIconEl = document.createElement("i"), lastInteractionTextEl = document.createElement("div"), optionsIconEl = document.createElement("i");
    personEl.classList.add("person"), avatarEl.classList.add("avatar"), personData.avatar && (avatarEl.loading = "lazy"), personInfoEl.classList.add("person-info"), personNameEl.classList.add("person-name"), lastInteractionEl.classList.add("last-interaction"), lastInteractionIconEl.classList.add("material-icons"), optionsIconEl.classList.add("material-icons", "person-options");
    let lastInteraction = (_a = personData.activities.filter((x) => x.type == "interaction")[0]) == null ? void 0 : _a.date;
    if (lastInteraction ? lastInteraction = dateToRelativeText(lastInteraction) : lastInteraction = "Never", personData.avatar && (avatarEl.src = personData.avatar), personNameEl.textContent = personData.name, lastInteractionIconEl.textContent = "chat_bubble", lastInteractionTextEl.textContent = lastInteraction, ((_b = options.interactionText) == null ? void 0 : _b.length) > 0 ? lastInteractionTextEl.textContent = options.interactionText : lastInteractionTextEl.textContent = lastInteraction, optionsIconEl.textContent = "more_horiz", lastInteractionEl.appendChild(lastInteractionIconEl), lastInteractionEl.appendChild(lastInteractionTextEl), personInfoEl.appendChild(personNameEl), detailsEl && personInfoEl.appendChild(detailsEl), personInfoEl.appendChild(lastInteractionEl), personEl.appendChild(avatarEl), personEl.appendChild(personInfoEl), options.hideOptions != !0 && personEl.appendChild(optionsIconEl), options.createOptions) {
      let contextMenu = new RightClickMenu(optionsIconEl, {
        allowClicking: !0
      });
      options.createOptions(contextMenu);
    }
    return personEl;
  }
  function createPersonDetails(detailsData) {
    let personDetailsEl = document.createElement("div"), personDetailsIconEl = document.createElement("i"), personDetailsTextEl = document.createElement("div");
    if (personDetailsEl.classList.add("person-details"), personDetailsIconEl.classList.add("material-icons"), detailsData.type == "date") {
      personDetailsIconEl.textContent = "calendar_today";
      let _months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], newDate = new Date(detailsData.weekDay), weekOffset = (newDate.getDay() - START_OF_DAY_OFFSET + 7) % 7;
      newDate.setDate(newDate.getDate() - weekOffset);
      let weekStart = newDate.getDate(), monthStart = _months[newDate.getMonth()].slice(0, 3);
      newDate.setDate(weekStart + 6);
      let weekEnd = newDate.getDate().toString().padStart(2, "0"), monthEnd = _months[newDate.getMonth()].slice(0, 3);
      personDetailsTextEl.textContent = \`\${weekStart.toString().padStart(2, "0")}\${monthStart != monthEnd ? \` \${monthStart}\` : ""}-\${weekEnd} \${monthEnd}\`;
    } else detailsData.type == "time" ? (personDetailsIconEl.textContent = "calendar_today", personDetailsTextEl.textContent = detailsData.text) : detailsData.type == "frequency" && (personDetailsIconEl.textContent = "schedule", personDetailsTextEl.textContent = detailsData.text);
    return personDetailsEl.appendChild(personDetailsIconEl), personDetailsEl.appendChild(personDetailsTextEl), personDetailsEl;
  }
  function withinThisWeek(date) {
    let today = Date.now(), newDate = new Date(date), weekOffset = (newDate.getDay() - START_OF_DAY_OFFSET + 7) % 7;
    return newDate.setDate(newDate.getDate() - weekOffset), newDate - today > 0 ? 1 : (newDate.setDate(newDate.getDate() + 7), newDate - today > 0 ? 0 : -1);
  }
  function dateToRelativeText(_date, { includeTime = !1 } = {}) {
    let date = new Date(_date), timeDiff = Date.now() - date;
    return isDateToday(date) ? includeTime ? date.toLocaleTimeString() : "Today" : isDateToday(date, 1) ? "Tomorrow" : isDateToday(date, -1) ? "Yesterday" : timeDiff > 0 && Math.abs(timeDiff) < 1e3 * 60 * 60 * 24 * 20 ? \`\${Math.floor(timeDiff / (1e3 * 60 * 60 * 24))} days ago\` : date.getFullYear() == (/* @__PURE__ */ new Date()).getFullYear() ? date.toDateString().slice(4, -5) : date.toDateString().slice(4);
  }
  function isDateToday(date, offset = 0) {
    let today = /* @__PURE__ */ new Date();
    today.setDate(today.getDate() + offset);
    let isToday = !0;
    return isToday && date.getDate() != today.getDate() && (isToday = !1), isToday && date.getMonth() != today.getMonth() && (isToday = !1), isToday && date.getFullYear() != today.getFullYear() && (isToday = !1), isToday;
  }
  return plugin;
})()
<\/script>\r
</body>\r
</html>`;

  // src-crm/plugin.js
  var AutoRemindOffsets = {
    week: () => Date.now() + AutoRemindOffsets._dayOffset * 7,
    weeks: (num) => Date.now() + AutoRemindOffsets._dayOffset * 7 * num,
    month: () => Date.now() + AutoRemindOffsets._dayOffset * 30,
    months: (num) => Date.now() + AutoRemindOffsets._dayOffset * 30 * num,
    year: () => Date.now() + AutoRemindOffsets._dayOffset * 365,
    years: (num) => Date.now() + AutoRemindOffsets._dayOffset * 365 * num,
    _dayOffset: 1e3 * 60 * 60 * 24
  }, plugin = {
    _noteContents: {},
    _useLocalNoteContents: !0,
    appOption: {
      "Add a Relationship": async function(app) {
        let creationPrompt = await app.prompt("Create a new Relationship", {
          inputs: [
            { label: "Person's Name", type: "string" },
            { label: "Auto remind", type: "select", options: [
              { label: "Every week", value: "every week" },
              { label: "Every 2 weeks", value: "every 2 weeks" },
              { label: "Every month", value: "every month" },
              { label: "Every 3 months", value: "every 2 months" },
              { label: "Every 6 months", value: "every 6 months" },
              { label: "Every year", value: "every year" },
              { label: "Don't remind", value: "never" }
            ] },
            { label: "Person's Tag", type: "select", options: [
              { label: "Client", value: "client" },
              { label: "Colleague", value: "colleague" },
              { label: "Family", value: "family" },
              { label: "Favorite", value: "favorite" },
              { label: "Friends", value: "friends" },
              { label: "None", value: "" }
            ] }
          ]
        });
        if (!creationPrompt) return;
        let [personName, autoRemind, personTag] = creationPrompt;
        if (!personName) return;
        let noteTags = ["person/" + (personTag || "")], noteUUID = await app.createNote(personName, noteTags), noteContent = `# Relationship
` + plugin._createRelationshipSection({
          autoRemind,
          reminders: [],
          activities: []
        });
        if (await app.insertNoteContent({ uuid: noteUUID }, noteContent), plugin._relationships != null) {
          let relationship = plugin._readRelationshipSection(noteContent);
          if (relationship == null) return;
          plugin._relationships.push({
            ...relationship,
            name: personName,
            tags: noteTags,
            uuid: noteUUID
          });
        }
      },
      "Update Relationship Notes": async function(app) {
        plugin._relationships != null && (plugin._relationships = null, plugin._noteContents = {}, await plugin._cacheRelationships(app), await app.alert("Synced changes in notes with dashboard..."));
      },
      "Update Settings": async function(app) {
        let newSettings = await app.prompt("Update Settings:", {
          inputs: [
            { label: "People's tag", type: "string", options: [
              { label: "Yes", value: "true" },
              { label: "No", value: "false" }
            ], value: app.settings[PERSON_TAG_SETTING] || PERSON_TAG_SETTING_DEFAULT || "person" },
            { label: "Start of week", type: "select", options: [
              { label: "Monday", value: "1" },
              { label: "Sunday", value: "0" }
            ], value: app.settings[START_OF_WEEK_SETTING] || START_OF_WEEK_SETTING_DEFAULT || "0" }
          ]
        });
        if (!newSettings) return;
        let [peopleTag, startOfWeek] = newSettings;
        await app.setSetting(PERSON_TAG_SETTING, peopleTag || "person"), await app.setSetting(START_OF_WEEK_SETTING, startOfWeek || "0");
      }
    },
    insertText: {
      "CRM Dashboard": {
        check() {
          return "CRM Dashboard";
        },
        run: async function(app) {
          if (await app.context.replaceSelection(
            `<object data="plugin://${app.context.pluginUUID}" data-aspect-ratio="2" />`
          )) return null;
        }
      }
    },
    async renderEmbed(app, args, source = "embed") {
      return await plugin._cacheRelationships(app), addWindowVariableToHtmlString(dashboard_default, "DashboardData", {
        START_OF_WEEK: parseInt(app.settings[START_OF_WEEK_SETTING] || START_OF_WEEK_SETTING_DEFAULT) || 0
      });
    },
    onEmbedCall: createOnEmbedCallHandler({
      getAllPeopleNotes: async (app) => plugin._relationships,
      addActivity: async (app, newActivity) => {
        var _a;
        let relationship = plugin._relationships.find((x) => x.uuid == newActivity.relationship.uuid);
        switch (newActivity == null ? void 0 : newActivity.type) {
          case "note":
            return relationship.activities.unshift({
              type: "note",
              date: /* @__PURE__ */ new Date(),
              note: newActivity.note
            }), await app.replaceNoteContent(
              { uuid: relationship.uuid },
              plugin._createActivitySection(relationship.activities),
              { section: _sectionFromHeadingText("Activity", { level: 2 }) }
            ), delete plugin._noteContents[relationship.uuid], !0;
          case "interaction":
            if (relationship.activities.unshift({
              type: "interaction",
              date: /* @__PURE__ */ new Date(),
              note: newActivity.note,
              method: newActivity.method
            }), (_a = relationship.autoRemind) != null && _a.toLowerCase().startsWith("every ")) {
              let remindType = relationship.autoRemind.trim().split(" ").at(-1), remindOffset = parseInt(relationship.autoRemind.trim().split(" ").at(-2));
              relationship.remindWeek = AutoRemindOffsets[remindType](remindOffset);
            }
            return await app.replaceNoteContent(
              { uuid: relationship.uuid },
              plugin._createRelationshipSection(relationship),
              { section: _sectionFromHeadingText("Relationship", { level: 1 }) }
            ), delete plugin._noteContents[relationship.uuid], !0;
        }
        return !1;
      },
      addReminder: async (app, newActivity) => {
        if (newActivity.type != "reminder") return;
        let startAt = newActivity.date;
        startAt.toLowerCase() == "today" ? startAt = Math.floor(Date.now() / 1e3) : startAt.toLowerCase() == "tomorrow" ? startAt = Math.floor(Date.now() / 1e3) + 60 * 60 * 24 : startAt.toLowerCase() == "next week" ? startAt = Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 7 : startAt.toLowerCase() == "next month" ? startAt = Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 30 : startAt = Math.floor(new Date(startAt).getTime() / 1e3);
        let relationship = plugin._relationships.find((x) => x.uuid == newActivity.relationship.uuid), taskUUID = await app.insertTask({ uuid: relationship.uuid }, {
          text: "this is a task",
          startAt
        });
        return relationship.reminders.unshift({
          text: newActivity.note,
          startAt,
          uuid: taskUUID
        }), await app.replaceNoteContent(
          { uuid: relationship.uuid },
          plugin._createRemindersSection(relationship.reminders),
          { section: _sectionFromHeadingText("Reminders", { level: 2 }) }
        ), delete plugin._noteContents[relationship.uuid], relationship.reminders;
      },
      removeReminder: async (app, noteUUID, taskUUID) => {
        let relationship = plugin._relationships.find((x) => x.uuid == noteUUID);
        return relationship.reminders = relationship.reminders.filter(
          (reminder) => reminder.uuid != taskUUID
        ), await app.replaceNoteContent(
          { uuid: relationship.uuid },
          plugin._createRemindersSection(relationship.reminders),
          { section: _sectionFromHeadingText("Reminders", { level: 2 }) }
        ), delete plugin._noteContents[relationship.uuid], relationship.reminders;
      },
      completeReminder: async (app, noteUUID, taskUUID) => {
        let relationship = plugin._relationships.find((x) => x.uuid == noteUUID), reminder = relationship.reminders.find(
          (reminder2) => reminder2.uuid == taskUUID
        );
        return reminder.completedAt = Math.floor(Date.now() / 1e3), await app.updateTask(
          taskUUID,
          { completedAt: reminder.completedAt }
        ), relationship.reminders;
      },
      navigateToNote: async (app, noteUUID) => app.navigate("https://www.amplenote.com/notes/" + noteUUID),
      // doesn't use cache
      getNoteRelationship: async (app, noteUUID) => {
        plugin._relationships != null && (plugin._relationships = plugin._relationships.filter(
          (x) => x.uuid != noteUUID
        ));
        let relationshipNote = await app.notes.find(noteUUID);
        if (!relationshipNote) return null;
        let relationshipNoteContent = await relationshipNote.content(), relationship = plugin._readRelationshipSection(relationshipNoteContent);
        if (relationship == null) return null;
        let newRelationship = {
          ...relationship,
          name: relationshipNote.name,
          tags: relationshipNote.tags,
          uuid: relationshipNote.uuid
        };
        return plugin._relationships != null && plugin._relationships.push(newRelationship), newRelationship;
      },
      // uses cache
      getRelationship: async (app, noteUUID) => {
        let currentNoteContents = await _noteContent((void 0)._noteContents, {
          uuid: noteUUID,
          content: () => app.getNoteContent({ uuid: noteUUID })
        });
        return plugin._readRelationshipSection(currentNoteContents);
      }
    }),
    async _cacheRelationships(app) {
      if (plugin._relationships != null) return;
      plugin._relationships = [];
      let peopleNotes = await app.notes.filter({ tag: "person" }), waitingProcesses = [];
      peopleNotes.forEach((personNote) => {
        let currentNoteContents = _noteContent(this._noteContents, personNote);
        waitingProcesses.push(currentNoteContents);
      });
      let peopleNotesContent = await Promise.all(waitingProcesses);
      plugin._relationships = peopleNotesContent.map((personNoteContent, personIndex) => {
        let relationship = plugin._readRelationshipSection(personNoteContent);
        return relationship == null ? null : {
          ...relationship,
          name: peopleNotes[personIndex].name,
          tags: peopleNotes[personIndex].tags,
          uuid: peopleNotes[personIndex].uuid
        };
      }).filter((x) => x), console.debug("relationships", plugin._relationships);
    },
    _readRelationshipSection(currentNoteContents) {
      var _a;
      let relatipshipSection = _sectionContent(currentNoteContents, "Relationship");
      if (relatipshipSection == "") return null;
      let avatarIcon = (_a = relatipshipSection.matchAll(/^\s*\!\[[^\[]*\]\((https:\/\/[^)]+)\)/gm).next().value) == null ? void 0 : _a[1], rs_table = _objectTableFromMarkdown(relatipshipSection), reminders = plugin._readRemindersSection(relatipshipSection), activities = plugin._readActivitySection(relatipshipSection);
      return {
        avatar: avatarIcon,
        reminders,
        activities,
        autoRemind: rs_table["Auto remind"],
        remindWeek: rs_table["Remind deadline"],
        generalNote: rs_table["General note"],
        familyInfo: rs_table["Family info"]
      };
    },
    _readRemindersSection(noteContent) {
      return _sectionContent(noteContent, "Reminders").trim().split(`
`).filter((x) => x.trim().startsWith("- [ ]")).map((task) => {
        let reminder = {
          text: task.split("- [ ]")[1].split("<!--")[0].trim()
        };
        if (task.includes("<!--"))
          try {
            let taskData = JSON.parse(task.split("<!--")[1].split("-->")[0].trim());
            reminder = {
              ...reminder,
              ...taskData
            };
          } catch {
          }
        return reminder;
      });
    },
    _readActivitySection(noteContent) {
      var _a;
      return ((_a = (_sectionContent(noteContent, "Activity").trim() + `
- `).match(/^- [^ ]+ (note|interaction)( \(.+\))? - (.|\n)*?(?=^\- )/gm)) == null ? void 0 : _a.map((line) => {
        let splittenLine = line.trim().split(" ");
        if (splittenLine.length < 4) return null;
        let type = splittenLine[2];
        if (!["note", "interaction"].includes(type)) return null;
        let activity = {
          type,
          date: new Date(splittenLine[1]),
          note: line.split(" - ").slice(1).join(" - ").trim()
        };
        if (type == "interaction") {
          let interactionMethod = line.split(") - ")[0].split("(")[1];
          activity.method = interactionMethod;
        }
        return activity;
      }).filter((x) => x !== null)) || [];
    },
    _createRelationshipSection(relationship) {
      var _a;
      let sectionContent = `
`;
      return relationship.avatar ? sectionContent += `![](${relationship.avatar})
` : sectionContent += `[No image]
`, sectionContent += `| | |
`, sectionContent += `|-|-|
`, sectionContent += _markdownFromTableRow([0, 1], ["Auto remind", relationship.autoRemind || "never"]), sectionContent += _markdownFromTableRow([0, 1], [
        "Remind deadline",
        (_a = relationship.autoRemind) != null && _a.toLowerCase().includes("every ") ? dateToText(relationship.remindWeek || "") : ""
      ]), sectionContent += _markdownFromTableRow([0, 1], ["General note", relationship.generalNote || ""]), sectionContent += _markdownFromTableRow([0, 1], ["Family info", relationship.familyInfo || ""]), sectionContent += `## Reminders
`, sectionContent += plugin._createRemindersSection(relationship.reminders), sectionContent += `
## Activity
`, sectionContent += plugin._createActivitySection(relationship.activities), sectionContent;
    },
    _createRemindersSection(reminders) {
      return reminders.map((reminder) => {
        let reminderDetails = "";
        if (reminder.uuid != null) {
          let taskData = { ...reminder };
          delete taskData.text, reminderDetails = `<!-- ${JSON.stringify(taskData)} -->`;
        }
        return `- [ ] ${reminder.text}${reminderDetails}`;
      }).join(`

`);
    },
    _createActivitySection(activities) {
      return activities.map((activity) => {
        let activityDetails = "";
        return activity.type == "interaction" && (activityDetails = ` (${activity.method.replace(/[^A-Za-z0-9- _]/g, "")})`), `- ${dateToText(activity.date)} ${activity.type}${activityDetails} - ${activity.note.replace(/^- /gm, `
    - `) || ""}`;
      }).join(`

`);
    }
  }, plugin_default = plugin;
  function dateToText(_date) {
    _date || (_date = Date.now());
    let date = new Date(_date);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
  }
  return plugin;
})()
//# sourceMappingURL=plugin.js.map
