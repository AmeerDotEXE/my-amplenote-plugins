import {
	CRM_PLUGIN_VERSION,
	PERSON_TAG_SETTING,
	START_OF_WEEK_SETTING,
} from "./constants.js";

export default {
	name: 'Personal CRM',
	description: 'Plugin to maintain interactions with people',
	settings: [
		PERSON_TAG_SETTING,
		START_OF_WEEK_SETTING,
	],
	version: CRM_PLUGIN_VERSION,
	icon: 'people',
	instructions: `
inspired by Covve.

**Steps to use plugin:**
- Start by typing \`{CRM Dashboard}\` in a note.
- You'll have a dashboard view in your note.
- To add People, run \`Add a Relationship\` command.

**Features:**
- Gives you a week window to contact the person.
- Allows multiple tags and sub-tags like \`person/friend\`.
- Can add notes, interactions and reminders (as tasks) like Covve.
- Replacing \`[No image]\` with an image will use the it as an avatar.
- Allows custom Auto Remind values, example \`every 14 weeks\`.

**Notes:**
- use \`Update Relationship Notes\` command to refresh cache.
- to update a single note, use the 3 dots in relationship list.

**Credits:**
- plugin-template by \`debanjandhar12\` on github
`.trim().replaceAll('\n', '<br />'),
	template: `
### Code
<<Code>>

### Changelog
2025/05/06 - First version
`.trim()
};
