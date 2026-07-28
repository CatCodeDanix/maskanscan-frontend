// app/(dashboard)/settings/actions.ts
"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function changePassword(formData: FormData) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		if (!session) throw new Error("Not authenticated");

		await auth.api.changePassword({
			body: {
				currentPassword: formData.get("currentPassword") as string,
				newPassword: formData.get("newPassword") as string,
			},
			headers: await headers(),
		});
		return { success: true };
	} catch (error) {
		console.error("Change password failed:", error);
		return { success: false, error: "Failed to change password" };
	}
}
