import BaseView from "./BaseView";



const ColumnIconByType = {
	title: "text_fields",
	checkbox: "check_circle_outline",
};

const ColumnCellByType = {
	title: (property) => property.title,
	checkbox: (property) => property.checkbox ? "✔" : "X",
};

export default class TableView extends BaseView {

	static icon = "grid_on";
	
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
		ViewData,
	}) {
		super(...arguments);
		this.ViewData = ViewData;
		const viewContentEl = document.getElementById("view-content");

		// clean main content
		Array.from(viewContentEl.children).forEach(c => c.remove());
		this.tableEl = document.createElement("table");
		this.tableTHeadEl = document.createElement("thead");
		this.tableTBodyEl = document.createElement("tbody");
		this.tableEl.classList.add("table-view");

		this.tableTHeadEl.appendChild(
			this._createRow(
				this.ViewData.format.properties
				.filter(viewProperty => viewProperty.visible !== false)
				.map(viewProperty => {
					const name = this.DatabaseSettings.properties[viewProperty.property].name || viewProperty.property
					return (tableRowColumnEl) => {
						const cellEl = document.createElement("div");
						const iconEl = document.createElement("span");
						const textEl = document.createElement("span");

						cellEl.classList.add("cell-icon");
						iconEl.classList.add("material-icons");

						iconEl.textContent = ColumnIconByType[this.DatabaseSettings.properties[viewProperty.property].type];
						textEl.textContent = name;

						cellEl.appendChild(iconEl);
						cellEl.appendChild(textEl);

						tableRowColumnEl.appendChild(cellEl);
					};
				})
			, { isHeader: true })
		);

		this.tableEl.appendChild(this.tableTHeadEl);
		this.tableEl.appendChild(this.tableTBodyEl);
		viewContentEl.appendChild(this.tableEl);
	}

	RefreshValues(DatabaseValues) {
		this.tableTBodyEl.append(...DatabaseValues.results.map(supertag => {
			return this._createRow(
				this.ViewData.format.properties
				.filter(viewProperty => viewProperty.visible !== false)
				.map(viewProperty => {
					const property = supertag.properties[viewProperty.property];
					if (typeof property == "undefined" || property === null) return "-";
					let propertyType = this.DatabaseSettings.properties[viewProperty.property]?.type;
					if (viewProperty.property == "checkbox") propertyType = "checkbox";
					return ColumnCellByType[propertyType]?.(supertag.properties[viewProperty.property]) ?? "-";
				})
			);
		}));
	}
	
	_createRow(rowData = [], { isHeader = false } = {}) {
		const tableRowEl = document.createElement("tr");
		
		tableRowEl.append(...rowData.map(column => {
			const tableRowColumnEl = document.createElement(isHeader ? "th" : "td");
			if (typeof column === "function") {
				column(tableRowColumnEl);
			} else tableRowColumnEl.textContent = column;
			return tableRowColumnEl;
		}));

		return tableRowEl;
	}
}