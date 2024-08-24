import _ from "lodash";

export function addTitleToRootNodeWithLink(root, title) {
    let href = `https://www.amplenote.com/notes/${window.noteUUID}`;
    return addTitleToRootNode(root, `<a href="javascript:void(0);" onclick="window.app.navigate('${href}')" class="anchor">🗈</a>${title}`);
}

export function addTitleToRootNode(root, title) {
    let node = _.cloneDeep(root);
    if (node.content === "") node.content = title;
    else node = { content: title, children: [node], type: 'heading', depth: 0 }
    return node;
}

export function removeEmptyChildrenFromRoot(node) {
    console.log(node);
    if (node.children) {
        node.children = node.children
            .map(removeEmptyChildrenFromRoot)
            .filter(child => (child.content !== "" && child.content !== "<br>")
                || (child.children && child.children.length > 0));
    }
    return node;
}
