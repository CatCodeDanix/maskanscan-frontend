import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./switch";

describe("Switch component", () => {
	it("renders unchecked by default", () => {
		render(<Switch aria-label="تنظیمات" />);
		const switchElem = screen.getByRole("switch", { name: "تنظیمات" });
		expect(switchElem).toBeInTheDocument();
		expect(switchElem).toHaveAttribute("aria-checked", "false");
	});

	it("toggles state when clicked by user", async () => {
		const handleCheckedChange = vi.fn();
		const user = userEvent.setup();

		render(
			<Switch aria-label="سوئیچ وضعیت" onCheckedChange={handleCheckedChange} />,
		);
		const switchElem = screen.getByRole("switch", { name: "سوئیچ وضعیت" });

		await user.click(switchElem);
		expect(handleCheckedChange).toHaveBeenCalledWith(true);
	});
});
