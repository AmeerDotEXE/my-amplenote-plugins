import {Markmap} from "markmap-view";
import {parseMarkdownAsMindMap} from "./parser.js";
import {createToolbar} from "./toolbar.js";

export async function initMarkMap(markdown) {
    const svgEl = document.querySelector('#markmap-svg');
    const options = {
        autoFit: false,
        duration: 10
        // TODO: add more from settings?
    }
    try {
        const { root, features } = parseMarkdownAsMindMap(markdown);
        // root.content = 'Mind Map';
        console.log('Rendering', markdown, root, features);
        const markmap = Markmap.create(svgEl, options, root);
        createToolbar(markmap, svgEl);
    } catch (error) {
        console.error(error);
    }
}

const initialHTML = document.body.outerHTML;
export function reloadMarkMap() {
    document.body.outerHTML = 'Reloading...';
    function setInnerHTMLAndExecuteScripts(element, html) {
        const newContent = document.createRange().createContextualFragment(html);
        element.innerHTML = '';
        element.append(newContent);
    }
    setInnerHTMLAndExecuteScripts(document.body, initialHTML);
}