import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DemoUser {
	id: string;
	name: string;
	email: string;
	avatar: string;
	plan: "pro" | "free";
	joinedDate: string;
}

const DEFAULT_DEMO_USER: DemoUser = {
	id: "demo-user-1",
	name: "کاربر دمو",
	email: "demo@maskanscan.ir",
	avatar: "",
	plan: "pro",
	joinedDate: "۱۴۰۳/۰۲/۱۵",
};

interface DemoAuthState {
	user: DemoUser | null;
	isAuthenticated: boolean;
	signIn: (email: string, password?: string, name?: string) => void;
	signUp: (name: string, email: string, password?: string) => void;
	signOut: () => void;
	updateUser: (updates: Partial<DemoUser>) => void;
}

export const useDemoAuthStore = create<DemoAuthState>()(
	persist(
		(set) => ({
			user: DEFAULT_DEMO_USER,
			isAuthenticated: true,

			signIn: (email, _password, name) => {
				const userName = name || email.split("@")[0] || "کاربر دمو";
				set({
					user: {
						id: `user-${Date.now()}`,
						name: userName,
						email: email || "user@maskanscan.ir",
						avatar: "",
						plan: "pro",
						joinedDate: new Date().toLocaleDateString("fa-IR"),
					},
					isAuthenticated: true,
				});
			},

			signUp: (name, email) => {
				set({
					user: {
						id: `user-${Date.now()}`,
						name: name || "کاربر جدید",
						email: email || "newuser@maskanscan.ir",
						avatar: "",
						plan: "free",
						joinedDate: new Date().toLocaleDateString("fa-IR"),
					},
					isAuthenticated: true,
				});
			},

			signOut: () => {
				set({
					user: null,
					isAuthenticated: false,
				});
			},

			updateUser: (updates) => {
				set((state) => ({
					user: state.user ? { ...state.user, ...updates } : null,
				}));
			},
		}),
		{
			name: "maskanscan-demo-auth",
		},
	),
);
