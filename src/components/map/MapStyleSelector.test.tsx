import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import MapStyleSelector from "./MapStyleSelector";

describe("MapStyleSelector component", () => {
	it("renders the layer switcher trigger with responsive mobile and desktop bottom classes", () => {
		render(<MapStyleSelector />);

		const button = screen.getByRole("button", { name: /نقشه‌ها/i });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass(
			"bottom-[calc(5rem+env(safe-area-inset-bottom,0px))]",
		);
		expect(button).toHaveClass(
			"md:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]",
		);
		expect(button).toHaveClass("left-6");
	});

	it("opens popover with map style and overlay options when clicked", async () => {
		const user = userEvent.setup();
		render(<MapStyleSelector />);

		const button = screen.getByRole("button", { name: /نقشه‌ها/i });
		await user.click(button);

		expect(screen.getByText("لایه‌های پس‌زمینه")).toBeInTheDocument();
		expect(screen.getByText("استایل‌های برداری")).toBeInTheDocument();
	});
});
