import chartHTML from './embed/chart.html?inline';
import {TABLE_CHART_CONFIG_DIALOG} from "./constants.js";
import {addWindowVariableToHtmlString} from "../common-utils/embed-helpers.js";
import _ from "lodash";

const plugin = {
    insertText: {
        "Insert chart from table": async function (app) {
            try {
                // Prompt for chart data
                const dialog = _.cloneDeep(TABLE_CHART_CONFIG_DIALOG);
                if (app.context.noteUUID)
                    dialog[1].inputs[1].value = app.context.noteUUID; // Set default note - doesn't work
                const promptResult = await app.prompt(...dialog);
                if (!promptResult) return;
                let [
                    CHART_TYPE,
                    DATA_SOURCE_NOTE_UUID,
                    CHART_TITLE,
                    TABLE_INDEX_IN_NOTE,
                    HORIZONTAL_AXIS_LABEL_DIRECTION,
                    START_FROM_ZERO,
                    CHART_ASPECT_RATIO_SIZE
                ] = promptResult;
                if (DATA_SOURCE_NOTE_UUID && DATA_SOURCE_NOTE_UUID.uuid) {
                    DATA_SOURCE_NOTE_UUID = DATA_SOURCE_NOTE_UUID.uuid;
                }
                const chartData = {
                    RANDOM_UUID: Math.random().toString(36).substring(7),
                    RENDERING_NOTE_UUID: app.context.noteUUID,
                    DATA_SOURCE: 'note',
                    CHART_TYPE,
                    DATA_SOURCE_NOTE_UUID,
                    DATA_SOURCE_HEADER_FILTER: '',  // For future use
                    CUMULATIVE: false,  // For future use
                    CHART_TITLE,
                    TABLE_INDEX_IN_NOTE,
                    HORIZONTAL_AXIS_LABEL_DIRECTION,
                    START_FROM_ZERO,
                    CHART_ASPECT_RATIO_SIZE
                };
                await this._validateChartConfig(chartData);
                await app.context.replaceSelection(`<object data="plugin://${ app.context.pluginUUID }?${encodeURIComponent(JSON.stringify(chartData))}" data-aspect-ratio="${chartData.CHART_ASPECT_RATIO_SIZE}" />`);
                return null;
            } catch (e) {
                console.error(e);
                await app.alert(e);
            }
        }
    },
    renderEmbed(app, args, source = 'embed') {
        try {
            const decodedChartData = JSON.parse(decodeURIComponent(args));
            return addWindowVariableToHtmlString(chartHTML, 'chartData', decodedChartData);
        } catch (e) {
            console.error(e);
            return 'Error parsing object tag';
        }
    },
    async onEmbedCall(app, commandName, ...args) {
        console.log('onEmbedCall', commandName, args);
        switch (commandName) {
            case 'getSettings':
                return { type: 'success', result: app.settings };
            case 'getAppProp':
                const propName = args[0];
                return { type: 'success', result: _.get(app, propName) };
            case 'saveFile':
                try {
                    let {name, data} = args[0];
                    if (data.startsWith('data:')) { // if data is url, convert to blob
                        const response = await fetch(data);
                        data = await response.blob();
                    }
                    const saved = await app.saveFile(data, name);
                    return { type: 'success', result: saved };
                } catch (e) {
                    return { type: 'error', result: e.message };
                }
            case 'updateChartObject':
                try {
                    const chartDataOld = args[0];
                    const dialog = _.cloneDeep(TABLE_CHART_CONFIG_DIALOG);
                    dialog[1].inputs[0].value = chartDataOld.CHART_TYPE;
                    dialog[1].inputs[1].value = chartDataOld.DATA_SOURCE_NOTE_UUID;
                    dialog[1].inputs[1].type = 'text';
                    dialog[1].inputs[2].value = chartDataOld.CHART_TITLE;
                    dialog[1].inputs[3].value = chartDataOld.TABLE_INDEX_IN_NOTE;
                    dialog[1].inputs[4].value = chartDataOld.HORIZONTAL_AXIS_LABEL_DIRECTION;
                    dialog[1].inputs[5].value = chartDataOld.START_FROM_ZERO;
                    dialog[1].inputs[6].value = chartDataOld.CHART_ASPECT_RATIO_SIZE;
                    const promptResult = await app.prompt(...dialog);
                    if (!promptResult) return;
                    let [
                        CHART_TYPE,
                        DATA_SOURCE_NOTE_UUID,
                        CHART_TITLE,
                        TABLE_INDEX_IN_NOTE,
                        HORIZONTAL_AXIS_LABEL_DIRECTION,
                        START_FROM_ZERO,
                        CHART_ASPECT_RATIO_SIZE
                    ] = promptResult;
                    if (DATA_SOURCE_NOTE_UUID) {
                        DATA_SOURCE_NOTE_UUID = await app.findNote({uuid: DATA_SOURCE_NOTE_UUID});
                        DATA_SOURCE_NOTE_UUID = DATA_SOURCE_NOTE_UUID.uuid;
                    }
                    const chartDataNew = {
                        ...chartDataOld,
                        CHART_TYPE,
                        DATA_SOURCE_NOTE_UUID,
                        CHART_TITLE,
                        TABLE_INDEX_IN_NOTE,
                        HORIZONTAL_AXIS_LABEL_DIRECTION,
                        START_FROM_ZERO,
                        CHART_ASPECT_RATIO_SIZE
                    };
                    await this._validateChartConfig(chartDataNew);

                    const originalNoteContent = await app.getNoteContent({uuid: chartDataOld.RENDERING_NOTE_UUID});
                    const originalEmbedTag = `<object data="plugin://${app.context.pluginUUID}?${encodeURIComponent(JSON.stringify(chartDataOld))}" data-aspect-ratio="${chartDataOld.CHART_ASPECT_RATIO_SIZE}" />`;
                    if (!originalNoteContent.includes(originalEmbedTag)) {
                        throw new Error('Original chart not found in note');
                    }
                    const newEmbedTag = `<object data="plugin://${app.context.pluginUUID}?${encodeURIComponent(JSON.stringify(chartDataNew))}" data-aspect-ratio="${chartDataNew.CHART_ASPECT_RATIO_SIZE}" />`;
                    const newNoteContent = originalNoteContent.replace(originalEmbedTag, newEmbedTag);
                    await app.replaceNoteContent({uuid: chartDataNew.RENDERING_NOTE_UUID}, newNoteContent);
                    return { type: 'success', result: 'Chart updated' };
                } catch (e) {
                    console.log(e);
                    app.alert('Error updating chart: ' + e.message);
                }
            default:
                try {
                    const result = await (_.get(app, commandName))(...args);
                    return { type: 'success', result: result };
                } catch (error) {
                    return { type: 'error', result: error.message };
                }
        }
    },
    async _validateChartConfig(chartData) {
        if (!chartData.CHART_TYPE || !['bar', 'line', 'area', 'pie', 'doughnut', 'polarArea'].includes(chartData.CHART_TYPE)) {
            throw new Error('Chart type is required');
        }
        if (!chartData.DATA_SOURCE_NOTE_UUID) {
            throw new Error('Data Source is required');
        }
        if (!chartData.DATA_SOURCE_NOTE_UUID) {
                throw new Error('Data Source is required');
        }
        if (!chartData.TABLE_INDEX_IN_NOTE || isNaN(chartData.TABLE_INDEX_IN_NOTE)) {
            throw new Error('TableIndex is required and must be a number');
        }
        if (!chartData.HORIZONTAL_AXIS_LABEL_DIRECTION || !['column', 'row'].includes(chartData.HORIZONTAL_AXIS_LABEL_DIRECTION)) {
            throw new Error('Horizontal (category) axis labels is required');
        }
        if (!chartData.CHART_ASPECT_RATIO_SIZE || isNaN(parseInt(chartData.CHART_ASPECT_RATIO_SIZE))) {
            throw new Error('Chart size is required');
        }
        return true;
    }
}

export default plugin;
