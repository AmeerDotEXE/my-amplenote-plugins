export const EMBED_COMMANDS_MOCK = {
    getNoteTasks: async (noteName) => {
		if (noteName == "May 2025") return null;
		if (noteName == "Week 18, 2025") return [];
        return [
			{
				"dismissedAt": Math.floor(Date.now() / 1000),
				"content": "app returned",
				"hideUntil": null,
				"important": false,
				"noteUUID": "33333333-2222-1111-9999-eeeeeeeeeeee",
				"score": 1.1,
				"startAt": null,
				"urgent": false,
				"uuid": "cccccccc-8888-4444-bbbb-eeeeeeeeeeee"
			},
			{
				"content": noteName,
				"hideUntil": null,
				"important": false,
				"noteUUID": "33333333-2222-1111-9999-eeeeeeeeeeee",
				"score": 1.1,
				"startAt": null,
				"urgent": false,
				"uuid": "22222222-cccc-4444-aaaa-dddddddddddd"
			},
			{
				"completedAt": Math.floor(Date.now() / 1000),
				"content": "3rd task",
				"hideUntil": null,
				"important": false,
				"noteUUID": "33333333-2222-1111-9999-eeeeeeeeeeee",
				"score": 1.1,
				"startAt": null,
				"urgent": false,
				"uuid": "dddddddd-4444-4444-bbbb-dddddddddddd"
			}
		];
    },
	addNoteTask: async (noteName, taskText) => {
		return {
			"content": taskText,
			"hideUntil": null,
			"important": false,
			"noteUUID": "33333333-2222-1111-9999-eeeeeeeeeeee",
			"score": 1.1,
			"startAt": null,
			"urgent": false,
			"uuid": "dddddddd-4444-4444-cccc-dddddddddddd"
		};
	},
	moveNoteTask: async (noteName, taskUUID) => {
		return true;
	},
	toggleTask: async (taskUUID, checked) => {
		return true;
	}
}

export const VIEW_DATA_MOCK = {
    VIEW_TYPE: 'horizon',
	START_OF_WEEK: 1
}