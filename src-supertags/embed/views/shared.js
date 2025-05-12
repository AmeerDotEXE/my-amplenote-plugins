import BaseView from "./BaseView";
import TableView from "./TableView";

/**
 * @type {{
 * 	[type: string]: typeof BaseView
 * }}
 */
export const VIEW_CLASSES = {
	table: TableView,
};