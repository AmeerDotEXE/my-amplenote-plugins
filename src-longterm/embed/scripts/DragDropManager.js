
export default class DragDropManager {
	/** @type {HTMLElement} */
	draggingItem = null;

	/**
	 * @type {{
	 * onIndex: number;
	 * onAdd?: (draggedEl, draggedData, dropIndex) => {};
	 * }?}
	 */
	droppingList = null;

	/** @param {HTMLElement} element */
	addDragable(element, data) {
		element.draggable = true;
		element.addEventListener("dragstart", (event) => {
			this.draggingItem = element;
			this.droppingList = null;
			element.classList.add('dragging');
		});

		element.addEventListener('dragend', () => {
			this.draggingItem = null;
			element.classList.remove('dragging');
			
			// update list
			if (!this.droppingList) return;
			// ? remove from current list

			// add into new list
			const dropIndex = this.droppingList.onIndex;
			const handleAdding = this.droppingList.onAdd;
			if (typeof handleAdding === "function")
				handleAdding(element, data, dropIndex);
		});
	}
	
	/** @param {HTMLElement} element */
	/**
	 * 
	 * @param {HTMLElement} element 
	 * @param {{
	 * onAdd?: (draggedEl: HTMLElement, draggedData, dropIndex: number | -1) => {};
	 * }?} param1 
	 */
	addDropable(element, {
		onAdd = null
	}) {
		element.addEventListener('dragover', (event) => {
			if (!this.draggingItem) return;
			event.preventDefault();
			
			const draggingOverItem = this._getDragAfterElement(element, event.clientY);
			if (draggingOverItem.element) {
				element.insertBefore(this.draggingItem, draggingOverItem.element);
			} else {
				element.appendChild(this.draggingItem); // Append to the end if no item below
			}

			this.droppingList = {
				onIndex: draggingOverItem.elementIndex,
				onAdd,
			};
		});
	}

	/**
	 * 
	 * @param {HTMLElement} container 
	 * @param {number} dragPosY 
	 * @returns element after the hovered position
	 */
	_getDragAfterElement(container, dragPosY) {
		const draggableElements = Array.from(container.children);
	
		return draggableElements.reduce((closest, child, childIndex) => {
			if (!child.draggable) return closest; // disallows placing above those
			const box = child.getBoundingClientRect();
			const offset = dragPosY - box.top - box.height / 2;

			if (offset < 0 && offset > closest.offset)
				return { offset: offset, elementIndex: childIndex, element: child };
			return closest;
		}, { offset: Number.NEGATIVE_INFINITY, elementIndex: -1, element: null });
	}
}