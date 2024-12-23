import "./App.css";

import { useState, useEffect } from "react";
import FibForm from "./components/FibForm";
import List, { LIST_DIRECTION } from "./components/List";

function App() {
	const [listOfSubmittedIndices, setListOfSubmittedIndices] = useState([]);
	const [listOfPreviousCalculations, setListOfPreviousCalculations] = useState(
		{}
	);

	useEffect(() => {
		(async () => {
			try {
				const indicesResponse = await fetch("/api/values/indices");
				const previousCalculationsResponse = await fetch(
					"/api/values/calculations"
				);

				if (!indicesResponse.ok || !previousCalculationsResponse.ok) {
					throw new Error(
						`Response code for indicesResponse = ${indicesResponse.status} \n
             Response code for previousCalculationsResponse = ${previousCalculationsResponse.status}`
					);
				}

				const indices = await indicesResponse.json();
				const previousCalculations = await previousCalculationsResponse.json();

				setListOfSubmittedIndices(indices);
				setListOfPreviousCalculations(previousCalculations);
			} catch (error) {
				console.error(error.message);
			}
		})();
	}, []);

	return (
		<div className="App">
			<header className="App-header">
				<h1>Fibonacci Calculator</h1>
				<FibForm />
				<List
					title="Indicies I have seen (hardcoded because postgres is being a bitch):"
					listOfItems={listOfSubmittedIndices}
				/>
				<List
					title="Calculated values:"
					listOfItems={Object.values(listOfPreviousCalculations)}
					direction={LIST_DIRECTION.columns}
				/>
			</header>
		</div>
	);
}

export default App;
