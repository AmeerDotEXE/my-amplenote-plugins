import {
    NOTE_HIGHLIGHT_ORDER_SETTING, NOTE_HIGHLIGHT_ORDER_SETTING_DEFAULT,
    OMNIVORE_APP_URL,
    OMNIVORE_DASHBOARD_COLUMNS_SETTING,
    OMNIVORE_DASHBOARD_ORDER_SETTING,
    OMNIVORE_DASHBOARD_ORDER_SETTING_DEFAULT
} from "../constants.js";
import {sortOmnivoreItems, sortOmnivoreItemHighlights} from "./util.js";

// Generate dashboard table for Dashboard note
export async function generateDashboardTable(omnivoreItemsState, appSettings, getNoteUrlFromTitle) {
    let optionalColumns = (appSettings[OMNIVORE_DASHBOARD_COLUMNS_SETTING] || '').split(',').map(c => c.trim()) || [];
    optionalColumns = optionalColumns.filter(c => ['Author', 'Description', 'UpdatedAt', 'SavedAt', 'PageType', 'ReadingProgressPercent'].includes(c));
    const headers = '|**Cover**|**Title**'
    + `${optionalColumns.includes('Author') ? '|**Author**' : ''}`
    + `${optionalColumns.includes('Description') ? '|**Description**' : ''}`
    + `${optionalColumns.includes('UpdatedAt') ? '|**Updated At**' : ''}`
    + `${optionalColumns.includes('SavedAt') ? '|**Saved At**' : ''}`
    + `${optionalColumns.includes('PageType') ? '|**Page Type**' : ''}`
    + `${optionalColumns.includes('ReadingProgressPercent') ? '|**Reading Progress Percent**' : ''}`
    + '|**Omnivore Link**'
    + '|';
    const separator = '|---|---'
        + `${optionalColumns.map(() => '|---').join('')}`
        + '|---'
        + '|';
    const omnivoreItemsStateSorted = sortOmnivoreItems(omnivoreItemsState, appSettings[OMNIVORE_DASHBOARD_ORDER_SETTING]
        || OMNIVORE_DASHBOARD_ORDER_SETTING_DEFAULT);
    const rows = await Promise.all(omnivoreItemsStateSorted.map(async note => {
        const row = `|![\\|180](${note.image})`
            + `|${note.url ? `[${note.title}](${await getNoteUrlFromTitle(note.title)})` : note.title}`
            + `${optionalColumns.includes('Author') ? `|${note.author}` : ''}`
            + `${optionalColumns.includes('Description') ? `|${note.description}` : ''}`
            + `${optionalColumns.includes('UpdatedAt') ? `|${new Date(note.updatedAt).toLocaleString()}` : ''}`
            + `${optionalColumns.includes('SavedAt') ? `|${new Date(note.savedAt).toLocaleString()}` : ''}`
            + `${optionalColumns.includes('PageType') ? `|${note.pageType}` : ''}`
            + `${optionalColumns.includes('ReadingProgressPercent') ? `|${note.readingProgressPercent}%` : ''}`
            + `|[Omnivore Link](${OMNIVORE_APP_URL}/me/${note.slug})`
            + '|';
        return row;
    }));
    return [headers, separator, ...rows].join('\n');
}

// Generate highlight section for the Highlight note
export function generateNoteHighlightSectionMarkdown(omnivoreItemsState, appSettings) {
    const highlights = omnivoreItemsState.highlights || [];
    const highlightsSorted = sortOmnivoreItemHighlights(highlights, appSettings[NOTE_HIGHLIGHT_ORDER_SETTING]
        || NOTE_HIGHLIGHT_ORDER_SETTING_DEFAULT);
    const properHighlights = highlightsSorted.map(highlight => {
       if (!highlight.quote) return null;
       return `**Highlight [↗️](${OMNIVORE_APP_URL}/me/${omnivoreItemsState.slug}#${highlight.id}):**\n`+
              `> ${highlight.quote.split('\n').join(' ')}\n`;
    }).filter(h => h);
    if (properHighlights.length === 0) {
        return `(No highlights - [create one](${OMNIVORE_APP_URL}/me/${omnivoreItemsState.slug}))`;
    }
    return properHighlights.join('\n');
}

// Generate summary section for the Highlight note
export function generateNoteSummarySectionMarkdown(omnivoreItemsState, appSettings) {
    return `![\\|180](${omnivoreItemsState.image})\n` +
           `- **Author:** ${omnivoreItemsState.author}\n` +
           `- **Description:** ${omnivoreItemsState.description}\n` +
           `- **Page Type:** ${omnivoreItemsState.pageType}\n` +
           `- **Updated At:** ${new Date(omnivoreItemsState.updatedAt).toLocaleString()}\n` +
           `- **Saved At:** ${new Date(omnivoreItemsState.savedAt).toLocaleString()}\n` +
           `- **Reading Progress Percent:** ${omnivoreItemsState.readingProgressPercent} / 100\n`;
}
