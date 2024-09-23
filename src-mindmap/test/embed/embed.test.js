import html from "inline:../../embed/index.html";
import {chromium} from "playwright";
import {addScriptToHtmlString, addWindowVariableToHtmlString} from "../../../common-utils/embed-helpers.js";
import {createMockCallAmplenotePlugin, serializeWithFunctions} from "../../../common-utils/embed-comunication.js";
import {callAmplenotePluginCommandMock} from "./embed.testdata.js";

describe('mindmap embed', () => {
    it('should initialize and render markmap', async () => {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();
        const htmlWithMockApp = addScriptToHtmlString(html, "window.callAmplenotePluginMock = " + JSON.stringify(serializeWithFunctions({
            ...callAmplenotePluginCommandMock,
            "getNoteContentByUUID": async (noteUUID) => {
                return "# Hello World"
            },
        })));
        await page.setContent(htmlWithMockApp);
        await page.waitForSelector('.markmap-svg');
        await page.waitForFunction(() => {
            const svg = document.querySelector('.markmap-svg');
            return svg && svg.childNodes.length >= 2;
        });
        const svgText = await page.$eval('.markmap-svg', el => el.textContent);
        expect(svgText).toContain('Hello World');
        await browser.close();
    }, 10000);
    it('should load toolbar items', async () => {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();
        const htmlWithMockApp = addScriptToHtmlString(html, "window.callAmplenotePluginMock = " + JSON.stringify(serializeWithFunctions(
            callAmplenotePluginCommandMock
        )));
        await page.setContent(htmlWithMockApp);
        await page.waitForSelector('.mm-toolbar-item');
        const toolbarItems = await page.$$('.mm-toolbar-item');
        expect(toolbarItems.length).toBeGreaterThan(1);
        await browser.close();
    }, 10000);
});