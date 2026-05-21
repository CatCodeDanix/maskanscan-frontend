"use server";

import { auth } from "@/lib/auth";

export async function requestPasswordReset(formData: FormData) {
  try {
    await auth.api.requestPasswordReset({
      body: {
        email: formData.get("email") as string,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      },
    });
    return {
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent.",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to send reset email",
    };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const result = await auth.api.resetPassword({
      body: {
        newPassword,
        token,
      },
    });

    if (result.status) {
      return { success: true, message: "Password reset successfully" };
    }
    return { success: false, error: "Failed to reset password" };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to reset password",
    };
  }
}
