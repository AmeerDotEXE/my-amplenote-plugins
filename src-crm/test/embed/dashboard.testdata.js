
export const EMBED_COMMANDS_MOCK = {
    getAllPeopleNotes: async () => {
        return [
			{
				avatar: null,
				reminders: [
					{ 
						"text": "watch movie", "startAt": Math.floor(Date.now() / 1000) + 60*60*24*8,
						"uuid": "22222222-aaaa-4444-9999-11111111111",
					},
					{ 
						"text": "watch movie d",
						"uuid": "ffffffff-2222-4444-9999-999999999999",
					},
					{
						"text": "send him the plugin", "startAt": Math.floor(Date.now() / 1000) - 60*60*2,
						"uuid": "aaaaaaaa-5555-4444-aaaa-aaaaaaaaaaaa",
					},
				],
				activities: [
					{
						"type": "note", "date": Date.now(),
						"note": "nothing"
					},
					{
						"type": "interaction",
						"date": Date.now(),
						"note": "nothing",
						"method": "met in person"
					},
					{
						"type": "note", "date": Date.now(),
						"note": "ease\\\nyay new line"
					},
					{
						"type": "note", "date": Date.now() - 1000*60*60*24, // yesterday
						"note": "note\n\n    - sub note"
					},
				],
				autoRemind: "every month",
				remindWeek: Date.now() + 1000*60*60*24*7,
				generalNote: "nothing",
				familyInfo: "",
				name: "Bill",
				tags: [ "person/ceo" ],
				uuid:"55555555-2222-1111-9999-888888888888",
			},
			{
				avatar: "https://cdn.discordapp.com/avatars/683272246151610389/43404fabac58b00de4cfa85dd8cb7bee.webp",
				reminders: [],
				activities: [
					{
						"type": "note", "date": Date.now(),
						"note": "chatted"
					},
					{
						"type": "interaction",
						"date": Date.now() - 1000*60*60*24, // yesterday
						"note": "nothing",
						"method": "discord"
					},
				],
				autoRemind: "every week",
				remindWeek: Date.now(),
				generalNote: "nothing",
				familyInfo: "",
				name: "Mat",
				tags: [ "person/friends" ],
				uuid:"55555555-2222-1111-4444-888888888888",
			},
			{
				avatar: "https://cdn.discordapp.com/avatars/490593057281015860/429387cbb258aa0691045c4cc3c086b4.webp",
				reminders: [
					{ 
						"text": "send plugin", "startAt": Math.floor(Date.now() / 1000) - 60*60*24*5,
						"uuid": "22222222-aaaa-4444-5555-11111111111",
					},
				],
				activities: [],
				autoRemind: "every 2 weeks",
				remindWeek: Date.now() - 1000*60*60*24*7,
				generalNote: "nothing",
				familyInfo: "",
				name: "Lucian",
				tags: [ "person/friends", "person/ceo" ],
				uuid:"55555555-2222-1111-5555-888888888888",
			},
		];
    },
	addActivity: (newActivity) => {
		return new Promise(res => setTimeout(res, 1000, true));
	},
	addReminder: (newActivity) => {
		return new Promise(res => setTimeout(res, 1000, [{ 
			"text": newActivity.note, "startAt": Math.floor(Date.now() / 1000) + 60*60*24*7,
			"uuid": "22222222-bbbb-4444-9999-11111111111",
		}]));
	},
	removeReminder: (noteUUID, taskUUID) => {
		return new Promise(res => setTimeout(res, 1000, []));
	},
	completeReminder: (noteUUID, taskUUID) => {
		return new Promise(res => setTimeout(res, 1000, []));
	},
	navigateToNote: (noteUUID) => {
		return new Promise(res => setTimeout(res, 1000, true));
	},
	getNoteRelationship: async (noteUUID) => {
		return await EMBED_COMMANDS_MOCK.getRelationship(noteUUID);
	},
	getRelationship: async (noteUUID) => {
		return await EMBED_COMMANDS_MOCK.getAllPeopleNotes().then(x => x?.[0])
	},
}

export const DASHBOARD_DATA_MOCK = {
	START_OF_WEEK: 1,
};