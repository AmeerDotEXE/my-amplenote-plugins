import { createOnEmbedCallHandler } from "../common-utils/embed-comunication";
import { addWindowVariableToHtmlString } from "../common-utils/embed-helpers";
import noteHTML from "inline:./embed/note-database.html";

const plugin = {
	noteOption: {
		async check(app, noteUUID) {
			return await plugin._getDatabaseSettings(app, noteUUID) === null;
		},
		async run(app, noteUUID) {
			// create settings
			const settings = {
				properties: {
					"Name": {
						type: "title",
					},
					checkbox: {
						name: "Task?"
					}
				},
				views: [
					{
						type: "table",
						name: "My Table View",
						format: {
							properties: [
								{ property: "checkbox", visible: true },
								{ property: "Name" },
							],
						},
					},
				],
			};

			await plugin._setDatabaseSettings(app, noteUUID, settings);
		}
	},

	async renderEmbed(app, args, source = 'embed') {
		const argsObj = new URLSearchParams(args);
		return addWindowVariableToHtmlString(noteHTML, "DatabaseData", {
			supertagUUID: argsObj.get("supertagUUID") ?? app.context.noteUUID,
		});
	},
	onEmbedCall: createOnEmbedCallHandler({
		async getSupertagDatabase(app, supertagUUID) {
			return await plugin._getDatabaseSettings(app, supertagUUID) ?? {
				properties: {
					"Name": {
						type: "title",
					},
					checkbox: {
						name: "Task?"
					}
				},
				views: [
					{
						type: "table",
						name: "My Table View",
						format: {
							properties: [
								{ property: "checkbox", visible: true },
								{ property: "Name" },
							],
						},
					},
				],
			};
		},
		async getSupertags(app, supertagUUID) {
			const targetNoteHandle = { uuid: supertagUUID };
			const allBacklinkNotes = await app.getNoteBacklinks(targetNoteHandle);
			console.log("allBacklinkNotes", allBacklinkNotes);

			const allBacklinkContentsList = await Promise.all(
				allBacklinkNotes.map(async backlinkNote =>
					app.getNoteBacklinkContents(targetNoteHandle, backlinkNote)
				)
			);
			console.log("allBacklinkContentsList", allBacklinkContentsList);

			const allSupertags = [];
			allBacklinkContentsList.forEach((contentsList, backlinkIndex) => {
				allSupertags.push(...
					contentsList
					.filter((content, i) => contentsList.indexOf(content) === i)
					.map(content => ({
						parentNoteUUID: allBacklinkNotes[backlinkIndex].uuid,
						content: content.replace(/\\\n/g, "\n"),
					}))
				);
			});
			console.log("allSupertags", allSupertags);


			return {
				results: allSupertags,
			};
		},
	}),

	async _getDatabaseSettings(app, noteUUID) {
		const markdown = await app.getNoteContent({ uuid: noteUUID });
		let settingsStr = markdown.split("### Supertag")[1]?.split("```")[1];
		if (!settingsStr) return null;
		if (settingsStr.startsWith("c")) settingsStr = settingsStr.slice(1).trim();
		console.log({settingsStr});

		let settings = null;
		try {
			settings = JSON.parse(settingsStr);
		} catch {}
		console.log({settings});

		return settings;
	},
	async _setDatabaseSettings(app, noteUUID, settings) {
		const settingsStr = '```c\n'+JSON.stringify(settings)+'\n```\n\n';
		const section = { heading: { text: "Supertag", level: 3 }};
		const hasReplaced = await app.replaceNoteContent({ uuid: noteUUID }, settingsStr, { section });
		if (hasReplaced) return;

		await app.insertNoteContent({ uuid: noteUUID }, `<object data="plugin://${ app.context.pluginUUID }?supertagUUID=${noteUUID}" data-aspect-ratio="1.3333" />`+"\n\n### Supertag\n\n"+settingsStr);
	},
}

export default plugin;

