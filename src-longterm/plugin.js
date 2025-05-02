import {
    SHOW_COMPLETED_TASKS_SETTING, SHOW_COMPLETED_TASKS_SETTING_DEFAULT,
    START_OF_WEEK_SETTING, START_OF_WEEK_SETTING_DEFAULT,
    FILTER_TAGS_SETTING, FILTER_TAGS_SETTING_DEFAULT,
} from "./constants.js";
import longtermHTML from "inline:./embed/longterm-note.html";
import { createOnEmbedCallHandler } from "../common-utils/embed-comunication.js";
import { addWindowVariableToHtmlString } from "../common-utils/embed-helpers.js";

const plugin = {
    appOption: {
        "Update Settings": async function(app) {
            const newSettings = await app.prompt("Update Settings:", {
                inputs: [
                    { label: "Show completed tasks", type: "select", options: [
                        { label: "Yes", value: "true" },
                        { label: "No", value: "false" },
                    ], value: app.settings[SHOW_COMPLETED_TASKS_SETTING] || SHOW_COMPLETED_TASKS_SETTING_DEFAULT || "true" },
                    { label: "Start of week", type: "select", options: [
                        { label: "Monday", value: "1" },
                        { label: "Sunday", value: "0" },
                    ], value: app.settings[START_OF_WEEK_SETTING] || START_OF_WEEK_SETTING_DEFAULT || "0" },
                    {
                        label: "Filter tags",
                        type: "tags",
                        limit: 3,
                    },
                ]
            });
            
            if (!newSettings) return;
            const [ showCompletedTasks, startOfWeek, filterTags ] = newSettings;
            await app.setSetting(SHOW_COMPLETED_TASKS_SETTING, showCompletedTasks);
            await app.setSetting(START_OF_WEEK_SETTING, startOfWeek);
            await app.setSetting(FILTER_TAGS_SETTING, filterTags || "");
        },
        "Open Horizon View": async function(app) {
            app.openSidebarEmbed(2, "horizon", 'sidebar');
        },
    },
    insertText: {
        "Horizon view": createExperssionForView("horizon"),
        "Years view": createExperssionForView("years"),
        "Months view": createExperssionForView("months"),
        "Weeks view": createExperssionForView("weeks"),
        "Days view": createExperssionForView("days"),
    },
    renderEmbed(app, args, source = 'embed') {
        return addWindowVariableToHtmlString(longtermHTML, "ViewData", {
            VIEW_TYPE: args,
            START_OF_WEEK: parseInt(app.settings[START_OF_WEEK_SETTING] || START_OF_WEEK_SETTING_DEFAULT) || 0
        });
    },
    onEmbedCall: createOnEmbedCallHandler({
        getNoteTasks: async (app, noteName) => {
            const note = await plugin._findNote(app, noteName);
            if (!note) return null;

            const includeDone = (
                app.settings[SHOW_COMPLETED_TASKS_SETTING] ||
                SHOW_COMPLETED_TASKS_SETTING_DEFAULT
            ) === "true";
            const tasks = await app.getNoteTasks(note, { includeDone });
            return tasks;
        },
        addNoteTask: async (app, noteName, taskText) => {
            const note = await plugin._findNote(app, noteName, true);
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
            const note = await plugin._findNote(app, noteName, true);
            if (!note) return null;

            return await app.updateTask(taskUUID, { noteUUID: note.uuid });
        },
        toggleTask: async (app, taskUUID, checked) => {
            let completedAt = null;
            if (checked) completedAt = Math.floor(Date.now() / 1000);

            return await app.updateTask(taskUUID, { completedAt });
        },
    }),
    async _findNote(app, noteName, canCreate = false) {
        const tagsList = (
            app.settings[FILTER_TAGS_SETTING] ||
            FILTER_TAGS_SETTING_DEFAULT
        ).split(",").filter(x => x);

        let note = await app.findNote({ name: noteName, tags: tagsList });
        if (note) return note;

        if (canCreate) {
            // if daily task, use daily-jots
            const dailtJotRx = /\w{3,} \d{1,2}(st|nd|rd|th), \d{4}/;
            if (dailtJotRx.test(noteName)) tagsList.push("daily-jots");

            const uuid = await app.createNote(noteName, tagsList);
            return { uuid };
        }

        return null;
    },
}

export default plugin;


function createExperssionForView(viewType) {
    return {
        check() { return viewType },
        run: async function(app) {
            if (await app.context.replaceSelection(
                `<object data="plugin://${ app.context.pluginUUID }?${viewType}" data-aspect-ratio="2" />`
            )) return null;
            // couldn't add embed
        }
    };
}