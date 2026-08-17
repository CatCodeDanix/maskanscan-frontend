"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function signOut() {
	try {
		await auth.api.signOut({
			headers: await headers(),
		});
		return { success: true };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to sign out";
		return {
			success: false,
			error: message,
		};
	}
}
