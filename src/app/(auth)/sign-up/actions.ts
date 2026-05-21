"use server";

import { auth } from "@/lib/auth";

export async function signUp(formData: FormData) {
  try {
    const { user, token } = await auth.api.signUpEmail({
      body: {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        name: formData.get("name") as string,
      },
    });
    return { success: true, user };
  } catch (error) {
    console.error("Sign up failed:", error);
    return { success: false, error: "Failed to create account" };
  }
}
