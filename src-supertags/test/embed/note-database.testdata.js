
export const EMBED_COMMANDS_MOCK = {
	async getSupertagDatabase(supertagUUID) {
		return {
			properties: {
				"Movie Name": {
					type: "title",
				},
				"Has Watched": {
					type: "checkbox",
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
							{ property: "Movie Name" },
							{ property: "Has Watched", visible: true },
						],
					},
				},
				{
					type: "table",
					name: "Other Table View",
					format: {
						properties: [
							{ property: "Movie Name" },
							{ property: "Has Watched", visible: true },
							{ property: "checkbox", visible: true },
						],
					},
				},
			],
		};
	},
	async getSupertags(supertagUUID) {
		return {
			results: [
				{
					parentNoteUUID: "note-1",
					content: `link test for supertags [@movie](https://www.amplenote.com/notes/${supertagUUID}) testing`,
				},
				{
					parentNoteUUID: "note-1",
					content: `Truman Show [@movie](https://www.amplenote.com/notes/${supertagUUID}?supertag=%7B%22Has%20Watched%22%3A%7B%22checkbox%22%3Atrue%7D%7D) `,
				},
				{
					parentNoteUUID: "note-1",
					content: ` - [ ] Watch a Movie [@movie](https://www.amplenote.com/notes/${supertagUUID}) `,
				},
				{
					parentNoteUUID: "note-2",
					content: ` - [x]  [@movie](https://www.amplenote.com/notes/${supertagUUID})  Watch Spongebob<!-- {"uuid":"task-1"} -->  `,
				},
			],
		};
	},
}

export const DATABASE_DATA_MOCK = {
	supertagUUID: "note-tag-1",
};