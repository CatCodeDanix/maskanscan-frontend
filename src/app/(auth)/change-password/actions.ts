"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function changePassword(formData: FormData) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return { success: false, error: "You must be logged in" };
		}

		await auth.api.changePassword({
			body: {
				currentPassword: formData.get("currentPassword") as string,
				newPassword: formData.get("newPassword") as string,
			},
			headers: await headers(),
		});

		return { success: true, message: "Password changed successfully" };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to change password";
		return {
			success: false,
			error: message,
		};
	}
}
