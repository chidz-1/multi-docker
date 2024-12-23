export const LIST_DIRECTION = { rows: 1, columns: 2 };

function renderList(listOfItems, direction) {
	if (direction === LIST_DIRECTION.rows) {
		return listOfItems.join(", ");
	}

	// Return column formatted list
	return (
		<ul>
			{listOfItems.map((singleItem, index) => (
				<li key={`item-${index}`}>{singleItem}</li>
			))}
		</ul>
	);
}

export default function List({
	title = null,
	listOfItems = [],
	direction = LIST_DIRECTION.rows,
}) {
	return (
		<div>
			{title && <h3>{title}</h3>}
			{renderList(listOfItems, direction)}
		</div>
	);
}
