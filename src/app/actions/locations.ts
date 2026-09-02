"use server";

import type { LocationTree, Province } from "@/types/listing";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:9000";

export async function getLocationTreeAction(): Promise<{
	success: boolean;
	tree: Province[];
	error?: string;
}> {
	try {
		const res = await fetch(`${BACKEND_URL}/api/locations/tree`, {
			next: { revalidate: 86400 },
		});

		if (!res.ok) {
			return {
				success: false,
				tree: [],
				error: `Backend responded ${res.status}`,
			};
		}

		const data = (await res.json()) as LocationTree;
		return { success: true, tree: data.tree ?? [] };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return { success: false, tree: [], error: message };
	}
}
