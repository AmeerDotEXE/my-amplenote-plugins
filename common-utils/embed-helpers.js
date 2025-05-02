import {createCallAmplenotePluginMock, deserializeWithFunctions} from "./embed-comunication.js";

export const addScriptToHtmlString = (htmlString, scriptContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const script = doc.createElement('script');
    script.textContent = scriptContent;

    const head = doc.head;
    if (head.firstChild) {
        head.insertBefore(script, head.firstChild);
    } else {
        head.appendChild(script);
    }

    return doc.documentElement.outerHTML.replaceAll('\\x3Cscript>', () => '<script>');
};

export const addWindowVariableToHtmlString = (htmlString, variableName, variableValue) => {
    const scriptContent = `window.${variableName} = ${JSON.stringify(variableValue)};`;

    return addScriptToHtmlString(htmlString, scriptContent);
};

export const setupPluginCallMock = (EMBED_COMMANDS_MOCK) => {
    if (process.env.NODE_ENV === 'development') {
        window.callAmplenotePlugin = window.callAmplenotePlugin || createCallAmplenotePluginMock(EMBED_COMMANDS_MOCK);
    } else {
        if (window.INJECTED_EMBED_COMMANDS_MOCK)
            window.callAmplenotePlugin = createCallAmplenotePluginMock(deserializeWithFunctions(window.INJECTED_EMBED_COMMANDS_MOCK));
    }
}
export const appConnector = new Proxy({}, {
    get: function(target, prop, receiver) {
        if (prop in target) {
            return target[prop];
        }
        return async function(...args) {
            return await window.callAmplenotePlugin(prop, ...args);
        };
    }
});