
export default class BaseView {

	static icon = "grid_on";

	DatabaseSettings;

	/**
	 * @type {{
	 *	type: "table";
	 *	name: string;
	 *	format: {
	 *		properties: {
	 *			property: string;
	 *			visible?: boolean;
	 *		}[];
	 *	}
	 *}}
	 */
	ViewData;

	constructor({
		DatabaseSettings,
		ViewData,
	}) {
		this.DatabaseSettings = DatabaseSettings;
	}

	RefreshValues(DatabaseValues) {}
}