import { beforeEach, describe, expect, it } from "vitest";
import { useDemoAuthStore } from "./demo-auth-store";

describe("DemoAuthStore", () => {
	beforeEach(() => {
		useDemoAuthStore.setState({
			user: null,
			isAuthenticated: false,
		});
	});

	it("should sign in with custom details", () => {
		useDemoAuthStore
			.getState()
			.signIn("test@example.com", "123456", "تستر دمو");

		const state = useDemoAuthStore.getState();
		expect(state.isAuthenticated).toBe(true);
		expect(state.user?.name).toBe("تستر دمو");
		expect(state.user?.email).toBe("test@example.com");
	});

	it("should sign up new demo user", () => {
		useDemoAuthStore.getState().signUp("کاربر جدید", "new@example.com");

		const state = useDemoAuthStore.getState();
		expect(state.isAuthenticated).toBe(true);
		expect(state.user?.name).toBe("کاربر جدید");
		expect(state.user?.plan).toBe("free");
	});

	it("should sign out cleanly", () => {
		useDemoAuthStore.getState().signIn("test@example.com");
		expect(useDemoAuthStore.getState().isAuthenticated).toBe(true);

		useDemoAuthStore.getState().signOut();
		expect(useDemoAuthStore.getState().isAuthenticated).toBe(false);
		expect(useDemoAuthStore.getState().user).toBeNull();
	});
});
