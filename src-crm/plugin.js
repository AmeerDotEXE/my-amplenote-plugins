import { createOnEmbedCallHandler } from "../common-utils/embed-comunication";
import { addWindowVariableToHtmlString } from "../common-utils/embed-helpers";
import {
	PERSON_TAG_SETTING, PERSON_TAG_SETTING_DEFAULT,
	START_OF_WEEK_SETTING, START_OF_WEEK_SETTING_DEFAULT
} from "./constants";
import { _noteContent, _sectionContent } from "./lib/amplenote_rw";
import { _sectionsFromMarkdown, _objectTableFromMarkdown, _sectionFromHeadingText, _markdownFromTableRow } from "./lib/markdown";
import dashboardHTML from "inline:./embed/dashboard.html";

const AutoRemindOffsets = {
	week: () => Date.now() + AutoRemindOffsets._dayOffset*7,
	weeks: (num) => Date.now() + AutoRemindOffsets._dayOffset*7*num,
	month: () => Date.now() + AutoRemindOffsets._dayOffset*30,
	months: (num) => Date.now() + AutoRemindOffsets._dayOffset*30*num,
	year: () => Date.now() + AutoRemindOffsets._dayOffset*365,
	years: (num) => Date.now() + AutoRemindOffsets._dayOffset*365*num,

	_dayOffset: 1000*60*60*24,
};

const plugin = {
	_noteContents: {},
	_useLocalNoteContents: true,

	appOption: {
		"Add a Relationship": async function(app) {
			// prompt for a name & a tag & frequency
			const creationPrompt = await app.prompt("Create a new Relationship", {
				inputs: [ 
					{ label: "Person's Name", type: "string" },
					{ label: "Auto remind", type: "select", options: [
						{ label: "Every week", value: "every week" },
						{ label: "Every 2 weeks", value: "every 2 weeks" },
						{ label: "Every month", value: "every month" },
						{ label: "Every 3 months", value: "every 2 months" },
						{ label: "Every 6 months", value: "every 6 months" },
						{ label: "Every year", value: "every year" },
						{ label: "Don't remind", value: "never" },
					] },
					{ label: "Person's Tag", type: "select", options: [
						{ label: "Client", value: "client" },
						{ label: "Colleague", value: "colleague" },
						{ label: "Family", value: "family" },
						{ label: "Favorite", value: "favorite" },
						{ label: "Friends", value: "friends" },
						{ label: "None", value: "" },
					] },
				]
			});
			if (!creationPrompt) return;
			const [ personName, autoRemind, personTag ] = creationPrompt;
			if (!personName) return;

			// create note
			const noteTags = [ "person/"+(personTag||"") ];
			const noteUUID = await app.createNote(personName, noteTags);
			const noteContent = "# Relationship\n" + plugin._createRelationshipSection({
				autoRemind,
				reminders: [],
				activities: [],
			});
			await app.insertNoteContent({ uuid: noteUUID }, noteContent );

			// update local
			if (plugin._relationships != null) {
				const relationship = plugin._readRelationshipSection(noteContent);
				if (relationship == null) return;
				plugin._relationships.push({
					...relationship,
					name: personName,
					tags: noteTags,
					uuid: noteUUID,
				});
			}
		},
		"Update Relationship Notes": async function(app) {
			if (plugin._relationships == null) return;

			plugin._relationships = null;
			plugin._noteContents = {};
			await plugin._cacheRelationships(app);
			await app.alert("Synced changes in notes with dashboard...")
		},
		"Update Settings": async function(app) {
			const newSettings = await app.prompt("Update Settings:", {
				inputs: [
					{ label: "People's tag", type: "string", options: [
						{ label: "Yes", value: "true" },
						{ label: "No", value: "false" },
					], value: app.settings[PERSON_TAG_SETTING] || PERSON_TAG_SETTING_DEFAULT || "person" },
					{ label: "Start of week", type: "select", options: [
						{ label: "Monday", value: "1" },
						{ label: "Sunday", value: "0" },
					], value: app.settings[START_OF_WEEK_SETTING] || START_OF_WEEK_SETTING_DEFAULT || "0" },
				]
			});
			
			if (!newSettings) return;
			const [ peopleTag, startOfWeek ] = newSettings;
			await app.setSetting(PERSON_TAG_SETTING, peopleTag || "person");
			await app.setSetting(START_OF_WEEK_SETTING, startOfWeek || "0");
		},
	},

    insertText: {
        "CRM Dashboard": {
			check() { return "CRM Dashboard" },
			run: async function(app) {
				if (await app.context.replaceSelection(
					`<object data="plugin://${ app.context.pluginUUID }" data-aspect-ratio="2" />`
				)) return null;
				// couldn't add embed
			}
		},
    },
	async renderEmbed(app, args, source = 'embed') {
		await plugin._cacheRelationships(app);
		return addWindowVariableToHtmlString(dashboardHTML, "DashboardData", {
			START_OF_WEEK: parseInt(app.settings[START_OF_WEEK_SETTING] || START_OF_WEEK_SETTING_DEFAULT) || 0
		});
	},
	onEmbedCall: createOnEmbedCallHandler({
		getAllPeopleNotes: async (app) => {
			return plugin._relationships;
		},
		addActivity: async (app, newActivity) => {
			// ! im not using note content again, but got the objects cached...
			const relationship = plugin._relationships.find(x => x.uuid == newActivity.relationship.uuid);
			switch (newActivity?.type) {
				case "note":
					// update locally
					relationship.activities.unshift({
						"type": "note", "date": new Date(),
						"note": newActivity.note,
					});

					// update note
					await app.replaceNoteContent(
						{ uuid: relationship.uuid },
						plugin._createActivitySection(relationship.activities),
						{ section: _sectionFromHeadingText("Activity", { level: 2 }) },
					);
					delete plugin._noteContents[relationship.uuid];
					return true;
				case "interaction":
					// update locally
					relationship.activities.unshift({
						"type": "interaction",
						"date": new Date(),
						"note": newActivity.note,
						"method": newActivity.method,
					});
					
					// update remind week according to auto remind
					if (relationship.autoRemind?.toLowerCase().startsWith("every ")) {
						const remindType = relationship.autoRemind.trim().split(" ").at(-1);
						const remindOffset = parseInt(relationship.autoRemind.trim().split(" ").at(-2));
						relationship.remindWeek = AutoRemindOffsets[remindType](remindOffset);
					}

					// update note
					await app.replaceNoteContent(
						{ uuid: relationship.uuid },
						plugin._createRelationshipSection(relationship),
						{ section: _sectionFromHeadingText("Relationship", { level: 1 }) },
					);
					delete plugin._noteContents[relationship.uuid];
					return true;
			}
			return false;
		},
		addReminder: async (app, newActivity) => {
			if (newActivity.type != "reminder") return;

			// could use switch case
			let startAt = newActivity.date;
			if (startAt.toLowerCase() == "today") startAt = Math.floor(Date.now() / 1000);
			else if (startAt.toLowerCase() == "tomorrow") startAt = Math.floor(Date.now() / 1000) + 60*60*24;
			else if (startAt.toLowerCase() == "next week") startAt = Math.floor(Date.now() / 1000) + 60*60*24*7;
			else if (startAt.toLowerCase() == "next month") startAt = Math.floor(Date.now() / 1000) + 60*60*24*30;
			else startAt = Math.floor((new Date(startAt)).getTime() / 1000);

			// add task
			const relationship = plugin._relationships.find(x => x.uuid == newActivity.relationship.uuid);
			const taskUUID = await app.insertTask({ uuid: relationship.uuid }, {
				text: "this is a task",
				startAt,
			});

			// update locally
			relationship.reminders.unshift({ 
				"text": newActivity.note, "startAt": startAt,
				uuid: taskUUID,
			});

			// update note
			await app.replaceNoteContent(
				{ uuid: relationship.uuid },
				plugin._createRemindersSection(relationship.reminders),
				{ section: _sectionFromHeadingText("Reminders", { level: 2 }) },
			);
			delete plugin._noteContents[relationship.uuid];
			return relationship.reminders;
		},
		removeReminder: async (app, noteUUID, taskUUID) => {
			// update locally
			const relationship = plugin._relationships.find(x => x.uuid == noteUUID);
			relationship.reminders = relationship.reminders.filter(reminder => 
				reminder.uuid != taskUUID,
			);

			// update note
			await app.replaceNoteContent(
				{ uuid: relationship.uuid },
				plugin._createRemindersSection(relationship.reminders),
				{ section: _sectionFromHeadingText("Reminders", { level: 2 }) },
			);
			delete plugin._noteContents[relationship.uuid];
			return relationship.reminders;
		},
		completeReminder: async (app, noteUUID, taskUUID) => {
			// update locally
			const relationship = plugin._relationships.find(x => x.uuid == noteUUID);
			const reminder = relationship.reminders.find(reminder => 
				reminder.uuid == taskUUID,
			);
			reminder.completedAt = Math.floor(Date.now() / 1000);

			// update note
			await app.updateTask(taskUUID,
				{ completedAt: reminder.completedAt },
			);

			// returning the reminders list, is unnessecary
			return relationship.reminders;
		},
		navigateToNote: async (app, noteUUID) => {
			return app.navigate("https://www.amplenote.com/notes/"+noteUUID);
		},
		// doesn't use cache
		getNoteRelationship: async (app, noteUUID) => {
			if (plugin._relationships != null) {
				plugin._relationships = plugin._relationships.filter(x => 
					x.uuid != noteUUID
				);
			}

			const relationshipNote = await app.notes.find(noteUUID);
			if (!relationshipNote) return null;

			let relationshipNoteContent = await relationshipNote.content();
			const relationship = plugin._readRelationshipSection(relationshipNoteContent);
			if (relationship == null) return null;

			const newRelationship = {
				...relationship,
				name: relationshipNote.name,
				tags: relationshipNote.tags,
				uuid: relationshipNote.uuid,
			};

			if (plugin._relationships != null) {
				plugin._relationships.push(newRelationship);
			}

			return newRelationship;
		},
		// uses cache
		getRelationship: async (app, noteUUID) => {
			let currentNoteContents = await _noteContent(this._noteContents, {
				uuid: noteUUID,
				content: () => app.getNoteContent({ uuid: noteUUID }),
			});

			return plugin._readRelationshipSection(currentNoteContents);
		},
	}),

	async _cacheRelationships(app) {
		if (plugin._relationships != null) return;

		plugin._relationships = [];
		const peopleNotes = await app.notes.filter({ tag: "person" });
		
		const waitingProcesses = [];
		peopleNotes.forEach(personNote => {
			const currentNoteContents = _noteContent(this._noteContents, personNote);
			waitingProcesses.push(currentNoteContents);
		});

		const peopleNotesContent = await Promise.all(waitingProcesses);
		plugin._relationships = peopleNotesContent.map((personNoteContent, personIndex) => {
			const relationship = plugin._readRelationshipSection(personNoteContent);
			if (relationship == null) return null;
			return {
				...relationship,
				name: peopleNotes[personIndex].name,
				tags: peopleNotes[personIndex].tags,
				uuid: peopleNotes[personIndex].uuid,
			}
		}).filter(x => x);

		console.debug("relationships", plugin._relationships);
	},
	
	_readRelationshipSection(currentNoteContents) {
		const relatipshipSection = _sectionContent(currentNoteContents, "Relationship");
		if (relatipshipSection == "") return null;

		let avatarIcon = relatipshipSection.matchAll(/^\s*\!\[[^\[]*\]\((https:\/\/[^)]+)\)/gm).next().value?.[1];
		let rs_table = _objectTableFromMarkdown(relatipshipSection);
		const reminders = plugin._readRemindersSection(relatipshipSection);
		const activities = plugin._readActivitySection(relatipshipSection);

		return {
			avatar: avatarIcon,
			reminders,
			activities,
			autoRemind: rs_table["Auto remind"],
			remindWeek: rs_table["Remind deadline"],
			generalNote: rs_table["General note"],
			familyInfo: rs_table["Family info"],
		}
	},
	_readRemindersSection(noteContent) {
		const remindersSection = _sectionContent(noteContent, "Reminders").trim();
		const reminders = remindersSection.split("\n")
			.filter(x => x.trim().startsWith("- [ ]")) // remove empty lines
			.map(task => {
				let reminder = {
					text: task.split("- [ ]")[1].split("<!--")[0].trim(),
				};

				if (task.includes("<!--")) {
					try {
						const taskData = JSON.parse(task.split("<!--")[1].split("-->")[0].trim());
						reminder = {
							...reminder,
							...taskData,
						};
					} catch {}
				}

				return reminder;
			});
		
		return reminders;
	},
	_readActivitySection(noteContent) {
		const activitySection = _sectionContent(noteContent, "Activity").trim();
		const activities = (activitySection+"\n- ")
			.match(/^- [^ ]+ (note|interaction)( \(.+\))? - (.|\n)*?(?=^\- )/gm)
			?.map(line => {
				const splittenLine = line.trim().split(" ");
				if (splittenLine.length < 4) return null;

				const type = splittenLine[2];
				if (!["note", "interaction"].includes(type)) return null;

				const activity = {
					type,
					date: new Date(splittenLine[1]),
					note: line.split(" - ").slice(1).join(" - ").trim(),
				};

				if (type == "interaction") {
					const interactionMethod = line.split(") - ")[0].split("(")[1];
					activity.method = interactionMethod;
				}

				return activity;
			}).filter(x => x !== null);
		
		return activities || [];
	},

	_createRelationshipSection(relationship) {
		let sectionContent = "\n";

		if (relationship.avatar) sectionContent += `![](${relationship.avatar})\n`;
		else sectionContent += "[No image]\n";

		sectionContent += "| | |\n";
		sectionContent += "|-|-|\n";
		sectionContent += _markdownFromTableRow([0, 1], ["Auto remind", relationship.autoRemind || "never"]);
		sectionContent += _markdownFromTableRow([0, 1], [
			"Remind deadline", relationship.autoRemind?.toLowerCase().includes("every ") ?
			dateToText(relationship.remindWeek || "") : ""
		]);
		sectionContent += _markdownFromTableRow([0, 1], ["General note", relationship.generalNote || ""]);
		sectionContent += _markdownFromTableRow([0, 1], ["Family info", relationship.familyInfo || ""]);

		sectionContent += "## Reminders\n";
		sectionContent += plugin._createRemindersSection(relationship.reminders);
		
		sectionContent += "\n## Activity\n";
		sectionContent += plugin._createActivitySection(relationship.activities);

		return sectionContent;
	},
	_createRemindersSection(reminders) {
		return reminders.map(reminder => {
			let reminderDetails = "";
			if (reminder.uuid != null) {
				let taskData = { ...reminder };
				delete taskData.text;
				reminderDetails = `<!-- ${JSON.stringify(taskData)} -->`;
			}
			return `- [ ] ${reminder.text}${reminderDetails}`;
		}).join("\n\n");
	},
	_createActivitySection(activities) {
		return activities.map(activity => {
			let activityDetails = "";
			if (activity.type == "interaction") {
				activityDetails = ` (${activity.method.replace(/[^A-Za-z0-9- _]/g, "")})`;
			}
			return `- ${
				dateToText(activity.date)
			} ${activity.type}${activityDetails} - ${
				activity.note.replace(/^- /gm, "\n    - ") || ""
			}`;
		}).join("\n\n");
	},
}

export default plugin;



function dateToText(_date) {
	if (!_date) _date = Date.now();
	const date = new Date(_date);
	return `${
		date.getFullYear()
	}/${
		(date.getMonth() + 1).toString().padStart(2, "0")
	}/${
		date.getDate().toString().padStart(2, "0")
	}`;
}