// @ts-ignore
export const COMMON_EMBED_COMMANDS = {
    "navigate": async (app, url) => {
        if (app.navigate(url)) return true;
        if (window.open(url, '_blank')) return true;
        return false;
    },
    "prompt": async (app, ...args) => {
        return await app.prompt(...args);
    },
    "getSettings": async (app) => {
        return app.settings;
    },
    "setSetting": async (app, key, value) => {
        return app.setSetting(key, value);
    },
    "getNoteTitleByUUID": async (app, noteUUID) =>  {
        return (await app.notes.find(noteUUID)).name;
    },
    "getNoteContentByUUID": async (app, noteUUID) => {
        return await app.getNoteContent({uuid: noteUUID});
    },
    "getNoteSections": async (app, ...args) => {
        return await app.getNoteSections(...args);
    },
    "saveFile": async (app, ...args) => {
        try {
            let {name, data} = args[0];
            if (data.startsWith('data:')) {
                const response = await fetch(data);
                data = await response.blob();
            }
            return await app.saveFile(data, name);
        } catch (e) {
            throw e.message;
        }
    }
}

export function createOnEmbedCallHandler(embedCommands = {}) {
    return async function onEmbedCallHandler(app, commandName, ...args) {
        console.log('onEmbedCall', commandName, args);
        try {
            if (commandName in embedCommands) {
                return await embedCommands[commandName](app, ...args);
            }
        } catch (e) {
            app.alert("Error:", e.message || e);
            console.error(e);
            throw e;
        }
        throw new Error(`Unknown command: ${commandName}`);
    }
}

export function createCallAmplenotePluginMock(embedCommandsMock) {
    return async(commandName, ...args) => {
        if (commandName in embedCommandsMock) {
            return await embedCommandsMock[commandName](...args);
        }
        throw new Error(`Unknown command: ${commandName}`);
    }
}

// @ts-ignore
export function serializeWithFunctions(obj) {
    // @ts-ignore
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'function') {
            return `__FUNCTION:${value.toString()}`;
        }
        return value;
    });
}

export function deserializeWithFunctions(str) {
    // @ts-ignore
    return JSON.parse(str, (key, value) => {
        if (typeof value === 'string' && value.startsWith('__FUNCTION:')) {
            const functionBody = value.slice('__FUNCTION:'.length);
            return new Function(`return ${functionBody}`)();
        }
        return value;
    });
}
