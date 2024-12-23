import { useState } from "react";

const FIB_MIN_MAX = [1, 40];

export default function FibForm() {
	const [fibIndex, setFibIndex] = useState(FIB_MIN_MAX[0]);

	async function onIndexSubmission(event) {
		event.preventDefault();
		// make call to server api to kickstart a new fibonacci calculation

		try {
			const response = await fetch("/api/values", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ index: fibIndex }),
			});

			if (!response.ok) {
				throw new Error(`Response status ${response.status}`);
			}

			alert(
				`Sent ${fibIndex} for calculation, refresh browser for calculation!`
			);
		} catch (error) {
			console.error(error.message);
		}
	}

	return (
		<form onSubmit={onIndexSubmission}>
			<fieldset>
				<label>Enter Your Index: </label>
				<input
					type="number"
					min={FIB_MIN_MAX[0]}
					max={FIB_MIN_MAX[1]}
					value={fibIndex}
					onChange={({ currentTarget: { value } }) => setFibIndex(value)}
				/>
				<button type="submit">Submit</button>
			</fieldset>
		</form>
	);
}
