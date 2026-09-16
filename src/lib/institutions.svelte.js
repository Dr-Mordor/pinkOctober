import { loadInstitutions } from "../data.js";

// Institutions load over the network and can resolve after the user has
// already picked a path. In the vanilla version that meant manually
// re-rendering the directory list once the fetch settled; here, App.svelte
// just reads `.list` and Svelte re-renders on its own once it's filled in.
class Institutions {
	list = $state([]);

	constructor() {
		loadInstitutions()
			.then((data) => {
				this.list = data;
			})
			.catch((error) => {
				console.error("could not load the institutions directory:", error);
			});
	}
}

export const institutions = new Institutions();
