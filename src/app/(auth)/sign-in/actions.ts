"use server";

import { auth } from "@/lib/auth";

export async function signIn(formData: FormData) {
	try {
		const { user } = await auth.api.signInEmail({
			body: {
				email: formData.get("email") as string,
				password: formData.get("password") as string,
			},
		});
		return { success: true, user };
	} catch (error) {
		console.error("Sign in failed:", error);
		return { success: false, error: "Invalid email or password" };
	}
}
