
// might rename it to ContextMenu
export default class RightClickMenu {

	/** @type {HTMLElement?} */
	currentMenu = null;

	/**
	 * @type {(
	 * MenuButton
	 * )[]}
	 */
	menuItems = [];

	options = {
		allowClicking: false,
		leftSided: false,
	}

	/**
	 * creates a context menu for element
	 * @param {HTMLElement} element 
	 */
	constructor(element, options) {
		this.options = {
			...this.options,
			...options,
		};
		if (element == null) return;
		element.addEventListener("contextmenu", this._openMenuEvent);
		if (this.options.allowClicking) element.addEventListener("click", this._openMenuEvent);
	}

	/** @private */
	_openMenuEvent = (event) => {
		event.preventDefault();
		this.openMenu(event.clientX, event.clientY);
	}
	openMenu(x = 0, y = 0) {
		if (this.currentMenu) this.closeMenu();
		const contextMenuEl = document.createElement("div");
		contextMenuEl.classList.add("context-menu");
		contextMenuEl.style.top = y+"px";
		if (!this.options.leftSided) {
			contextMenuEl.style.left = x+"px";
		} else {
			contextMenuEl.style.right = (window.innerWidth - x)+"px";
		}
		
		this._populateMenu(contextMenuEl);

		this.currentMenu = contextMenuEl;
		document.body.appendChild(contextMenuEl);
		requestAnimationFrame(() => {
			document.addEventListener('click', this._closeMenuEvent);
			document.addEventListener('contextmenu', this._closeMenuEvent);
		});
	}

	/** @private */
	_closeMenuEvent = (event) => this.closeMenu();
	closeMenu() {
		if (!this.currentMenu) return;
		document.removeEventListener('click', this._closeMenuEvent);
		document.removeEventListener('contextmenu', this._closeMenuEvent);
		this.currentMenu.remove();
	}

	
	/** @private */
	_populateMenu(menuEl) {
		this.menuItems.forEach(menuItem => {
			menuEl.appendChild(this._MenuItemsFn[menuItem.type](menuItem));
		});
	}

	/** @private */
	_MenuItemsFn = {
		button: this._createButton,
	};
	/**
	 * @private
	 * @param {MenuButton} menuItem
	 * */
	_createButton(menuItem) {
		const buttonEl = document.createElement("button");
		buttonEl.textContent = menuItem.text;

		buttonEl.addEventListener("click", menuItem.onCallback);

		return buttonEl;
	}



	/**
	 * @typedef {{
	 * type: "button";
	 * text: string;
	 * onCallback: function?;
	 * }} MenuButton
	 */
	addButton(text, onCallback, {
	} = {}) {
		this.menuItems.push({
			type: "button",
			text,
			onCallback,
		});
		return this;
	}
}
