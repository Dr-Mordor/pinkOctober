import { onMounted, ref } from "vue";
import { loadInstitutions } from "../data.js";

// Institutions load over the network and can resolve after the user has
// already picked a path. In the vanilla version that meant manually
// re-rendering the directory list once the fetch settled; here, components
// just read this ref and Vue re-renders them on its own once it's filled in.
export function useInstitutions() {
	const institutions = ref([]);

	onMounted(() => {
		loadInstitutions()
			.then((data) => {
				institutions.value = data;
			})
			.catch((error) => {
				console.error("could not load the institutions directory:", error);
			});
	});

	return institutions;
}
