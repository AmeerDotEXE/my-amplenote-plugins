import {
  LONGTERM_PLUGIN_VERSION,
  FILTER_TAGS_SETTING,
  SHOW_COMPLETED_TASKS_SETTING,
  START_OF_WEEK_SETTING
} from "./constants.js";

export default {
    name: 'Long-term view',
    description: 'Plugin to view tasks in different format',
    settings: [
		SHOW_COMPLETED_TASKS_SETTING,
		START_OF_WEEK_SETTING,
		FILTER_TAGS_SETTING,
	],
    version: LONGTERM_PLUGIN_VERSION,
    icon: 'calendar_view_week',
    instructions: `
inspired by timestripe horizons view.

**Steps to use plugin:**
- Start by typing \`{horizon}\` in a note.
- Tada! you'll have a horizon view in your note.
- Additionally, use \`Open Horizon View\` command  
  to get horizon view in sidebar.

**Views:**
- \`{horizon}\` - day, week, month, year, life goals.
- \`{days}\`, \`{weeks}\`, \`{months}\`, \`{years}\`.

**Notes:**
- use \`Update Settings\` command instead of plugin's settings page.
- daily tasks always use \`daily-jots\` tag.

**Credits:**
- plugin-template by \`debanjandhar12\` on github
`.trim().replaceAll('\n', '<br />'),
    template: `
### Code
<<Code>>

### Changelog
02/05/2025 - First version
`.trim()
};
