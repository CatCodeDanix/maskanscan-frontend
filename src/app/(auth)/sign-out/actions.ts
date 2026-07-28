"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function signOut() {
	try {
		await auth.api.signOut({
			headers: await headers(),
		});
		return { success: true };
	} catch (error: any) {
		return {
			success: false,
			error: error?.message || "Failed to sign out",
		};
	}
}
